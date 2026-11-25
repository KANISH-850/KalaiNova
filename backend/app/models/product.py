from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database.session import Base


def utcnow():
    return datetime.now(timezone.utc)


class ProductCategory(Base):
    __tablename__ = "product_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    icon_name = Column(String(60), nullable=True)

    products = relationship("Product", back_populates="category_rel")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    artisan_id = Column(Integer, ForeignKey("artisan_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("product_categories.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    category_name = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=False)
    original_transcript = Column(Text, nullable=True)
    source_language = Column(String(20), default="ta", nullable=False)
    tags = Column(Text, nullable=True)  # comma-separated
    material_cost = Column(Float, default=0.0, nullable=False)
    labour_cost = Column(Float, default=0.0, nullable=False)
    packaging_cost = Column(Float, default=0.0, nullable=False)
    other_cost = Column(Float, default=0.0, nullable=False)
    selling_price = Column(Float, nullable=False)
    wholesale_price = Column(Float, nullable=True)
    stock_quantity = Column(Integer, default=1, nullable=False)
    craft_complexity = Column(String(30), default="Medium", nullable=False)  # Low | Medium | High | Heritage
    production_hours = Column(Float, default=8.0, nullable=False)
    dimensions = Column(String(100), nullable=True)
    status = Column(String(30), default="approved", nullable=False, index=True)  # draft | pending | approved | rejected
    is_demo = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    artisan = relationship("ArtisanProfile", back_populates="products")
    category_rel = relationship("ProductCategory", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    translations = relationship("ProductTranslation", back_populates="product", cascade="all, delete-orphan")
    pricing_predictions = relationship("PricingPrediction", back_populates="product", cascade="all, delete-orphan")


class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    original_url = Column(String(500), nullable=False)
    enhanced_url = Column(String(500), nullable=True)
    bg_removed_url = Column(String(500), nullable=True)
    is_primary = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    product = relationship("Product", back_populates="images")


class ProductTranslation(Base):
    __tablename__ = "product_translations"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    language_code = Column(String(20), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    keywords = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    product = relationship("Product", back_populates="translations")
