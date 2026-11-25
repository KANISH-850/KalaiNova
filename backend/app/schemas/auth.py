from typing import Optional
from pydantic import BaseModel, Field


class RegisterRequest(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2, max_length=150)
    role: str = Field(default="artisan", pattern="^(artisan|buyer|admin)$")
    preferred_language: str = "ta"
    # Optional artisan fields
    craft_category: Optional[str] = None
    business_type: Optional[str] = "Individual Artisan"
    experience_years: Optional[int] = 1
    location: Optional[str] = None
    upi_id: Optional[str] = None
    bank_account_number: Optional[str] = None
    bank_ifsc: Optional[str] = None
    bank_name: Optional[str] = None
    # Optional buyer fields
    business_name: Optional[str] = None
    buyer_type: Optional[str] = "Retailer"
    preferred_categories: Optional[str] = None


class LoginRequest(BaseModel):
    identifier: str  # email or phone
    password: str


class ArtisanProfileUpdate(BaseModel):
    craft_category: Optional[str] = None
    business_type: Optional[str] = None
    experience_years: Optional[int] = None
    location: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    bio: Optional[str] = None
    upi_id: Optional[str] = None
    bank_account_number: Optional[str] = None
    bank_ifsc: Optional[str] = None
    bank_name: Optional[str] = None
    preferred_language: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    email: Optional[str] = None
    phone: Optional[str] = None
    full_name: str
    role: str
    preferred_language: str
    is_active: bool
    is_verified: bool
    is_demo: bool
    artisan_profile: Optional[dict] = None
    buyer_profile: Optional[dict] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
