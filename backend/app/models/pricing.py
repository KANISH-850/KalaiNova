from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database.session import Base


def utcnow():
    return datetime.now(timezone.utc)


class PricingFeature(Base):
    __tablename__ = "pricing_features"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="SET NULL"), nullable=True, index=True)
    artisan_id = Column(Integer, ForeignKey("artisan_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    category_name = Column(String(100), nullable=False)
    material_cost = Column(Float, nullable=False)
    labour_cost = Column(Float, nullable=False)
    packaging_cost = Column(Float, default=0.0, nullable=False)
    other_cost = Column(Float, default=0.0, nullable=False)
    production_hours = Column(Float, default=8.0, nullable=False)
    craft_complexity = Column(String(30), default="Medium", nullable=False)
    desired_margin_pct = Column(Float, default=25.0, nullable=False)
    demand_index = Column(Float, default=1.0, nullable=False)
    market_reference_price = Column(Float, nullable=True)
    shipping_cost = Column(Float, default=0.0, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    predictions = relationship("PricingPrediction", back_populates="feature_row", cascade="all, delete-orphan")


class PricingPrediction(Base):
    __tablename__ = "pricing_predictions"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="SET NULL"), nullable=True, index=True)
    feature_id = Column(Integer, ForeignKey("pricing_features.id", ondelete="CASCADE"), nullable=False, index=True)
    total_production_cost = Column(Float, nullable=False)
    xgboost_price = Column(Float, nullable=False)
    catboost_price = Column(Float, nullable=False)
    recommended_price = Column(Float, nullable=False)
    min_profitable_price = Column(Float, nullable=False)
    wholesale_price = Column(Float, nullable=False)
    retail_price = Column(Float, nullable=False)
    expected_profit = Column(Float, nullable=False)
    profit_margin_pct = Column(Float, nullable=False)
    explanation = Column(Text, nullable=False)
    model_version = Column(String(60), default="xgb+catboost-v1", nullable=False)
    accepted_by_artisan = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    product = relationship("Product", back_populates="pricing_predictions")
    feature_row = relationship("PricingFeature", back_populates="predictions")
