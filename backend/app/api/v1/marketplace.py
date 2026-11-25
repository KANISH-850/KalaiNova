from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ai.matching.semantic_matcher import score_products_for_buyer
from app.api.deps import get_current_user, require_buyer
from app.api.v1.products import serialize_product
from app.database.session import get_db
from app.models import (
    BuyerEnquiry,
    BuyerProfile,
    FinancialLedger,
    Notification,
    Order,
    OrderItem,
    PaymentRecord,
    Product,
    Transaction,
    User,
)
from app.schemas.marketplace_finance import BuyerMatchRequest, EnquiryCreate, EnquiryUpdate, OrderCreate

router = APIRouter(prefix="/marketplace", tags=["Marketplace"])


@router.get("/products")
def marketplace_products(
    category: Optional[str] = None,
    location: Optional[str] = None,
    search: Optional[str] = None,
    max_price: Optional[float] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    q = db.query(Product).filter(Product.status == "approved")
    if category:
        q = q.filter(Product.category_name.ilike(f"%{category}%"))
    if max_price is not None:
        q = q.filter(Product.selling_price <= max_price)
    if search:
        q = q.filter(Product.title.ilike(f"%{search}%") | Product.description.ilike(f"%{search}%"))
    items = q.order_by(Product.id.desc()).offset(skip).limit(limit).all()
    results = [serialize_product(p) for p in items]
    if location:
        results = [r for r in results if location.lower() in (r.get("artisan_location") or "").lower()]
    return results


@router.post("/match-buyers")
def match_products_semantically(
    payload: BuyerMatchRequest,
    db: Session = Depends(get_db),
):
    products = db.query(Product).filter(Product.status == "approved").all()
    serialized = [serialize_product(p) for p in products]
    ranked = score_products_for_buyer(
        serialized,
        query=payload.query,
        category=payload.category,
        location=payload.location,
        max_price=payload.max_price,
        min_quantity=payload.min_quantity or 1,
    )
    return ranked[: payload.top_k]


@router.post("/enquiries", status_code=status.HTTP_201_CREATED)
def create_enquiry(
    payload: EnquiryCreate,
    current_user: User = Depends(require_buyer),
    db: Session = Depends(get_db),
):
    buyer = db.query(BuyerProfile).filter(BuyerProfile.user_id == current_user.id).first()
    if not buyer:
        raise HTTPException(status_code=400, detail="Buyer profile required")

    prod = db.query(Product).filter(Product.id == payload.product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    enq = BuyerEnquiry(
        buyer_id=buyer.id,
        artisan_id=prod.artisan_id,
        product_id=prod.id,
        quantity=payload.quantity,
        offered_price_per_unit=payload.offered_price_per_unit or prod.wholesale_price or prod.selling_price,
        message=payload.message,
        match_score=0.9,
        status="pending",
    )
    db.add(enq)
    if prod.artisan:
        db.add(
            Notification(
                user_id=prod.artisan.user_id,
                title="New Bulk Enquiry",
                message=f"{buyer.business_name} requested {payload.quantity}x {prod.title}.",
                notif_type="enquiry",
            )
        )
    db.commit()
    db.refresh(enq)
    return {
        "id": enq.id,
        "product_id": enq.product_id,
        "artisan_id": enq.artisan_id,
        "buyer_id": enq.buyer_id,
        "quantity": enq.quantity,
        "offered_price_per_unit": enq.offered_price_per_unit,
        "message": enq.message,
        "status": enq.status,
    }


@router.get("/enquiries")
def list_enquiries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(BuyerEnquiry)
    if current_user.role == "buyer" and current_user.buyer_profile:
        q = q.filter(BuyerEnquiry.buyer_id == current_user.buyer_profile.id)
    elif current_user.role == "artisan" and current_user.artisan_profile:
        q = q.filter(BuyerEnquiry.artisan_id == current_user.artisan_profile.id)
    rows = q.order_by(BuyerEnquiry.id.desc()).all()
    return [
        {
            "id": e.id,
            "buyer_id": e.buyer_id,
            "buyer_name": e.buyer.business_name if e.buyer else None,
            "artisan_id": e.artisan_id,
            "product_id": e.product_id,
            "quantity": e.quantity,
            "offered_price_per_unit": e.offered_price_per_unit,
            "message": e.message,
            "match_score": e.match_score,
            "status": e.status,
            "created_at": e.created_at.isoformat() if e.created_at else None,
        }
        for e in rows
    ]


@router.put("/enquiries/{enquiry_id}")
def update_enquiry_status(
    enquiry_id: int,
    payload: EnquiryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    enq = db.query(BuyerEnquiry).filter(BuyerEnquiry.id == enquiry_id).first()
    if not enq:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    enq.status = payload.status
    db.commit()
    return {"id": enq.id, "status": enq.status}


@router.post("/orders", status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreate,
    current_user: User = Depends(require_buyer),
    db: Session = Depends(get_db),
):
    buyer = db.query(BuyerProfile).filter(BuyerProfile.user_id == current_user.id).first()
    if not buyer:
        raise HTTPException(status_code=400, detail="Buyer profile required")

    order_num = f"KN-ORD-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"
    order = Order(
        order_number=order_num,
        buyer_id=buyer.id,
        artisan_id=payload.artisan_id,
        total_amount=0.0,
        status="confirmed",
        payment_status="pending",
        shipping_address=payload.shipping_address or buyer.location,
    )
    db.add(order)
    db.flush()

    total = 0.0
    for item in payload.items:
        prod = db.query(Product).filter(Product.id == item.product_id).first()
        if not prod:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        unit_price = item.unit_price or prod.selling_price
        line_total = round(unit_price * item.quantity, 2)
        total += line_total
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=prod.id,
                product_title=prod.title,
                quantity=item.quantity,
                unit_price=unit_price,
                line_total=line_total,
            )
        )
    order.total_amount = round(total, 2)

    db.add(
        PaymentRecord(
            order_id=order.id,
            artisan_id=payload.artisan_id,
            amount=order.total_amount,
            payment_method="UPI",
            status="pending",
        )
    )
    db.commit()
    db.refresh(order)
    return {"id": order.id, "order_number": order.order_number, "total_amount": order.total_amount, "status": order.status}


@router.get("/orders")
def list_orders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    q = db.query(Order)
    if current_user.role == "buyer" and current_user.buyer_profile:
        q = q.filter(Order.buyer_id == current_user.buyer_profile.id)
    elif current_user.role == "artisan" and current_user.artisan_profile:
        q = q.filter(Order.artisan_id == current_user.artisan_profile.id)
    orders = q.order_by(Order.id.desc()).all()
    return [
        {
            "id": o.id,
            "order_number": o.order_number,
            "buyer_id": o.buyer_id,
            "buyer_name": o.buyer.business_name if o.buyer else None,
            "artisan_id": o.artisan_id,
            "total_amount": o.total_amount,
            "status": o.status,
            "payment_status": o.payment_status,
            "items": [
                {"product_id": i.product_id, "product_title": i.product_title, "quantity": i.quantity, "unit_price": i.unit_price, "line_total": i.line_total}
                for i in o.items
            ],
            "created_at": o.created_at.isoformat() if o.created_at else None,
        }
        for o in orders
    ]


@router.get("/notifications")
def list_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.id.desc()).limit(30).all()
    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "notif_type": n.notif_type,
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat() if n.created_at else None,
        }
        for n in rows
    ]
