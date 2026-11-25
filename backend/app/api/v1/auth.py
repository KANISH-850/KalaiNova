from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.security import (
    create_access_token,
    encrypt_sensitive,
    get_password_hash,
    mask_account_number,
    verify_password,
)
from app.database.session import get_db
from app.models import ArtisanProfile, BuyerProfile, User
from app.schemas.auth import ArtisanProfileUpdate, LoginRequest, RegisterRequest, TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _serialize_user(user: User) -> dict:
    ap = None
    if user.artisan_profile:
        p = user.artisan_profile
        ap = {
            "id": p.id,
            "craft_category": p.craft_category,
            "business_type": p.business_type,
            "experience_years": p.experience_years,
            "location": p.location,
            "district": p.district,
            "state": p.state,
            "bio": p.bio,
            "profile_photo_url": p.profile_photo_url,
            "upi_id": p.upi_id,
            "bank_name": p.bank_name,
            "bank_account_masked": p.bank_account_masked,
        }
    bp = None
    if user.buyer_profile:
        b = user.buyer_profile
        bp = {
            "id": b.id,
            "business_name": b.business_name,
            "buyer_type": b.buyer_type,
            "location": b.location,
            "preferred_categories": b.preferred_categories,
            "min_order_qty": b.min_order_qty,
            "max_budget_per_unit": b.max_budget_per_unit,
        }
    return {
        "id": user.id,
        "email": user.email,
        "phone": user.phone,
        "full_name": user.full_name,
        "role": user.role,
        "preferred_language": user.preferred_language,
        "is_active": user.is_active,
        "is_verified": user.is_verified,
        "is_demo": user.is_demo,
        "artisan_profile": ap,
        "buyer_profile": bp,
    }


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if not payload.email and not payload.phone:
        raise HTTPException(status_code=400, detail="Either email or phone is required")

    if payload.email and db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")
    if payload.phone and db.query(User).filter(User.phone == payload.phone).first():
        raise HTTPException(status_code=409, detail="Phone already registered")

    user = User(
        email=payload.email,
        phone=payload.phone,
        password_hash=get_password_hash(payload.password),
        full_name=payload.full_name,
        role=payload.role,
        preferred_language=payload.preferred_language,
        is_verified=True,
        is_demo=False,
    )
    db.add(user)
    db.flush()

    if payload.role == "artisan":
        ap = ArtisanProfile(
            user_id=user.id,
            craft_category=payload.craft_category or "Handloom & Textiles",
            business_type=payload.business_type or "Individual Artisan",
            experience_years=payload.experience_years or 1,
            location=payload.location or "India",
            upi_id=payload.upi_id,
            bank_account_encrypted=encrypt_sensitive(payload.bank_account_number),
            bank_ifsc_encrypted=encrypt_sensitive(payload.bank_ifsc),
            bank_name=payload.bank_name,
            bank_account_masked=mask_account_number(payload.bank_account_number),
        )
        db.add(ap)
    elif payload.role == "buyer":
        bp = BuyerProfile(
            user_id=user.id,
            business_name=payload.business_name or f"{payload.full_name} Enterprises",
            buyer_type=payload.buyer_type or "Retailer",
            location=payload.location or "India",
            preferred_categories=payload.preferred_categories or "Handloom & Textiles",
        )
        db.add(bp)

    db.commit()
    db.refresh(user)
    token = create_access_token(user.id, user.role)
    return {"access_token": token, "token_type": "bearer", "user": _serialize_user(user)}


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = (
        db.query(User)
        .filter((User.email == payload.identifier) | (User.phone == payload.identifier))
        .first()
    )
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")

    token = create_access_token(user.id, user.role)
    return {"access_token": token, "token_type": "bearer", "user": _serialize_user(user)}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return _serialize_user(current_user)


@router.put("/profile", response_model=UserResponse)
def update_profile(
    payload: ArtisanProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.preferred_language:
        current_user.preferred_language = payload.preferred_language

    if current_user.artisan_profile:
        ap = current_user.artisan_profile
        for field in ("craft_category", "business_type", "experience_years", "location", "district", "state", "bio", "upi_id", "bank_name"):
            val = getattr(payload, field)
            if val is not None:
                setattr(ap, field, val)
        if payload.bank_account_number:
            ap.bank_account_encrypted = encrypt_sensitive(payload.bank_account_number)
            ap.bank_account_masked = mask_account_number(payload.bank_account_number)
        if payload.bank_ifsc:
            ap.bank_ifsc_encrypted = encrypt_sensitive(payload.bank_ifsc)

    db.commit()
    db.refresh(current_user)
    return _serialize_user(current_user)
