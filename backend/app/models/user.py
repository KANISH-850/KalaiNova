from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database.session import Base


def utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=True)
    phone = Column(String(30), unique=True, index=True, nullable=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(150), nullable=False)
    role = Column(String(30), nullable=False, default="artisan", index=True)  # artisan | buyer | admin
    preferred_language = Column(String(20), nullable=False, default="ta")
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_demo = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    artisan_profile = relationship("ArtisanProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    buyer_profile = relationship("BuyerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class SHGGroup(Base):
    __tablename__ = "shg_groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    registration_number = Column(String(100), unique=True, nullable=True)
    district = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    member_count = Column(Integer, default=1, nullable=False)
    focus_craft = Column(String(120), nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_demo = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    artisans = relationship("ArtisanProfile", back_populates="shg_group")


class ArtisanProfile(Base):
    __tablename__ = "artisan_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    shg_group_id = Column(Integer, ForeignKey("shg_groups.id", ondelete="SET NULL"), nullable=True)
    craft_category = Column(String(100), nullable=False, index=True)
    business_type = Column(String(50), nullable=False, default="Individual Artisan")  # Individual Artisan | SHG | Cooperative
    experience_years = Column(Integer, default=1, nullable=False)
    location = Column(String(150), nullable=False, index=True)
    district = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    bio = Column(Text, nullable=True)
    profile_photo_url = Column(String(500), nullable=True)
    upi_id = Column(String(120), nullable=True)
    bank_account_encrypted = Column(Text, nullable=True)
    bank_ifsc_encrypted = Column(Text, nullable=True)
    bank_name = Column(String(120), nullable=True)
    bank_account_masked = Column(String(40), nullable=True)
    is_demo = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    user = relationship("User", back_populates="artisan_profile")
    shg_group = relationship("SHGGroup", back_populates="artisans")
    products = relationship("Product", back_populates="artisan", cascade="all, delete-orphan")


class BuyerProfile(Base):
    __tablename__ = "buyer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    business_name = Column(String(200), nullable=False)
    buyer_type = Column(String(60), nullable=False, default="Retailer")  # Retailer | Wholesaler | Boutique | Institutional | Online Marketplace
    location = Column(String(150), nullable=False, index=True)
    preferred_categories = Column(Text, nullable=True)  # comma-separated
    min_order_qty = Column(Integer, default=1, nullable=False)
    max_budget_per_unit = Column(Integer, default=50000, nullable=False)
    gst_number = Column(String(30), nullable=True)
    is_demo = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    user = relationship("User", back_populates="buyer_profile")
    enquiries = relationship("BuyerEnquiry", back_populates="buyer", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="buyer", cascade="all, delete-orphan")
