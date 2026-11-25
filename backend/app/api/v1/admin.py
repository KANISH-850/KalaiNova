from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from ai.common.registry import ModelRegistry
from app.api.deps import require_admin
from app.api.v1.products import serialize_product
from app.database.session import get_db
from app.models import (
    AIAgentAction,
    ArtisanProfile,
    BuyerProfile,
    Order,
    Product,
    SHGGroup,
    Transaction,
    User,
)

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard")
def admin_dashboard(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    total_artisans = db.query(ArtisanProfile).count()
    total_buyers = db.query(BuyerProfile).count()
    total_products = db.query(Product).count()
    approved_products = db.query(Product).filter(Product.status == "approved").count()
    total_orders = db.query(Order).count()
    total_shgs = db.query(SHGGroup).count()
    total_gmv = db.query(func.coalesce(func.sum(Order.total_amount), 0.0)).scalar() or 0.0
    total_income_tx = db.query(func.coalesce(func.sum(Transaction.amount), 0.0)).filter(Transaction.tx_type == "income").scalar() or 0.0

    return {
        "total_artisans": total_artisans,
        "total_buyers": total_buyers,
        "total_products": total_products,
        "approved_products": approved_products,
        "total_orders": total_orders,
        "total_shgs": total_shgs,
        "total_gmv": round(float(total_gmv), 2),
        "total_recorded_income": round(float(total_income_tx), 2),
    }


@router.get("/users")
def admin_users(current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.id.desc()).all()
    return [
        {
            "id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "phone": u.phone,
            "role": u.role,
            "preferred_language": u.preferred_language,
            "is_active": u.is_active,
            "is_demo": u.is_demo,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        }
        for u in users
    ]


@router.get("/products")
def admin_products(current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    products = db.query(Product).order_by(Product.id.desc()).all()
    return [serialize_product(p) for p in products]


@router.put("/products/{product_id}/status")
def admin_update_product_status(
    product_id: int,
    status: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    if status not in ("draft", "pending", "approved", "rejected"):
        raise HTTPException(status_code=400, detail="Invalid product status")
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    prod.status = status
    db.commit()
    return {"id": prod.id, "status": prod.status}


@router.get("/analytics")
def admin_analytics(current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    cat_counts = (
        db.query(Product.category_name, func.count(Product.id))
        .group_by(Product.category_name)
        .all()
    )
    shgs = db.query(SHGGroup).all()
    actions = db.query(AIAgentAction).order_by(AIAgentAction.id.desc()).limit(20).all()
    return {
        "category_distribution": [{"category": c, "count": cnt} for c, cnt in cat_counts],
        "shg_groups": [
            {"id": s.id, "name": s.name, "district": s.district, "state": s.state, "member_count": s.member_count, "focus_craft": s.focus_craft, "is_verified": s.is_verified}
            for s in shgs
        ],
        "models": ModelRegistry.get_all(db),
        "recent_agent_actions": [
            {"id": a.id, "agent_type": a.agent_type, "action_name": a.action_name, "confirmed": a.confirmed, "executed": a.executed}
            for a in actions
        ],
    }
