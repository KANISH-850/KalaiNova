from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_artisan
from app.database.session import get_db
from app.models import ArtisanProfile, Product, ProductCategory, ProductImage, ProductTranslation, User
from app.schemas.product import ProductCreate, ProductUpdate

router = APIRouter(prefix="/products", tags=["Products"])


def serialize_product(p: Product) -> dict:
    primary_img = next((img for img in p.images if img.is_primary), p.images[0] if p.images else None)
    return {
        "id": p.id,
        "artisan_id": p.artisan_id,
        "artisan_name": p.artisan.user.full_name if p.artisan and p.artisan.user else None,
        "artisan_location": p.artisan.location if p.artisan else None,
        "artisan_upi": p.artisan.upi_id if p.artisan else None,
        "title": p.title,
        "category_name": p.category_name,
        "description": p.description,
        "original_transcript": p.original_transcript,
        "source_language": p.source_language,
        "tags": p.tags,
        "material_cost": p.material_cost,
        "labour_cost": p.labour_cost,
        "packaging_cost": p.packaging_cost,
        "other_cost": p.other_cost,
        "selling_price": p.selling_price,
        "wholesale_price": p.wholesale_price,
        "stock_quantity": p.stock_quantity,
        "craft_complexity": p.craft_complexity,
        "production_hours": p.production_hours,
        "dimensions": p.dimensions,
        "status": p.status,
        "is_demo": p.is_demo,
        "primary_image_url": (primary_img.enhanced_url or primary_img.original_url) if primary_img else None,
        "images": [
            {
                "id": im.id,
                "original_url": im.original_url,
                "enhanced_url": im.enhanced_url,
                "bg_removed_url": im.bg_removed_url,
                "is_primary": im.is_primary,
            }
            for im in p.images
        ],
        "translations": [
            {
                "language_code": tr.language_code,
                "title": tr.title,
                "description": tr.description,
                "keywords": tr.keywords,
            }
            for tr in p.translations
        ],
        "created_at": p.created_at.isoformat() if p.created_at else None,
    }


@router.get("/categories")
def list_categories(db: Session = Depends(get_db)):
    cats = db.query(ProductCategory).all()
    return [{"id": c.id, "name": c.name, "slug": c.slug, "description": c.description, "icon_name": c.icon_name} for c in cats]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreate,
    current_user: User = Depends(require_artisan),
    db: Session = Depends(get_db),
):
    artisan = db.query(ArtisanProfile).filter(ArtisanProfile.user_id == current_user.id).first()
    if not artisan:
        raise HTTPException(status_code=400, detail="Artisan profile required to create products")

    cat = db.query(ProductCategory).filter(ProductCategory.name == payload.category_name).first()
    prod = Product(
        artisan_id=artisan.id,
        category_id=cat.id if cat else None,
        title=payload.title,
        category_name=payload.category_name,
        description=payload.description,
        original_transcript=payload.original_transcript,
        source_language=payload.source_language,
        tags=payload.tags,
        material_cost=payload.material_cost,
        labour_cost=payload.labour_cost,
        packaging_cost=payload.packaging_cost,
        other_cost=payload.other_cost,
        selling_price=payload.selling_price,
        wholesale_price=payload.wholesale_price or round(payload.selling_price * 0.85, 2),
        stock_quantity=payload.stock_quantity,
        craft_complexity=payload.craft_complexity,
        production_hours=payload.production_hours,
        dimensions=payload.dimensions,
        status="approved",
        is_demo=False,
    )
    db.add(prod)
    db.flush()

    if payload.image_url or payload.enhanced_image_url or payload.bg_removed_image_url:
        db.add(
            ProductImage(
                product_id=prod.id,
                original_url=payload.image_url or payload.enhanced_image_url or payload.bg_removed_image_url,
                enhanced_url=payload.enhanced_image_url,
                bg_removed_url=payload.bg_removed_image_url,
                is_primary=True,
            )
        )

    if payload.translations:
        for tr in payload.translations:
            db.add(
                ProductTranslation(
                    product_id=prod.id,
                    language_code=tr.get("language_code", "en"),
                    title=tr.get("title", payload.title),
                    description=tr.get("description", payload.description),
                    keywords=tr.get("keywords", payload.tags),
                )
            )

    db.commit()
    db.refresh(prod)
    return serialize_product(prod)


@router.get("")
def list_products(
    mine: bool = False,
    category: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Product)
    if mine and current_user.artisan_profile:
        q = q.filter(Product.artisan_id == current_user.artisan_profile.id)
    if category:
        q = q.filter(Product.category_name.ilike(f"%{category}%"))
    if search:
        q = q.filter(Product.title.ilike(f"%{search}%") | Product.description.ilike(f"%{search}%"))
    items = q.order_by(Product.id.desc()).offset(skip).limit(limit).all()
    return [serialize_product(p) for p in items]


@router.get("/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    return serialize_product(prod)


@router.put("/{product_id}")
def update_product(
    product_id: int,
    payload: ProductUpdate,
    current_user: User = Depends(require_artisan),
    db: Session = Depends(get_db),
):
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    if current_user.role != "admin" and (not current_user.artisan_profile or prod.artisan_id != current_user.artisan_profile.id):
        raise HTTPException(status_code=403, detail="Not authorized to modify this product")

    for field, val in payload.model_dump(exclude_unset=True).items():
        setattr(prod, field, val)
    db.commit()
    db.refresh(prod)
    return serialize_product(prod)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    current_user: User = Depends(require_artisan),
    db: Session = Depends(get_db),
):
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    if current_user.role != "admin" and (not current_user.artisan_profile or prod.artisan_id != current_user.artisan_profile.id):
        raise HTTPException(status_code=403, detail="Not authorized to delete this product")
    db.delete(prod)
    db.commit()
