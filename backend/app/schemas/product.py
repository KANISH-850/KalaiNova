from typing import List, Optional
from pydantic import BaseModel, Field


class ProductCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    category_name: str
    description: str
    original_transcript: Optional[str] = None
    source_language: str = "ta"
    tags: Optional[str] = None
    material_cost: float = 0.0
    labour_cost: float = 0.0
    packaging_cost: float = 0.0
    other_cost: float = 0.0
    selling_price: float = Field(..., gt=0)
    wholesale_price: Optional[float] = None
    stock_quantity: int = Field(default=1, ge=0)
    craft_complexity: str = "Medium"
    production_hours: float = 8.0
    dimensions: Optional[str] = None
    image_url: Optional[str] = None
    enhanced_image_url: Optional[str] = None
    bg_removed_image_url: Optional[str] = None
    translations: Optional[List[dict]] = None


class ProductUpdate(BaseModel):
    title: Optional[str] = None
    category_name: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[str] = None
    material_cost: Optional[float] = None
    labour_cost: Optional[float] = None
    packaging_cost: Optional[float] = None
    other_cost: Optional[float] = None
    selling_price: Optional[float] = None
    wholesale_price: Optional[float] = None
    stock_quantity: Optional[int] = None
    craft_complexity: Optional[str] = None
    production_hours: Optional[float] = None
    dimensions: Optional[str] = None
    status: Optional[str] = None


class PricingPredictRequest(BaseModel):
    product_id: Optional[int] = None
    category_name: str
    material_cost: float = Field(..., ge=0)
    labour_cost: float = Field(..., ge=0)
    packaging_cost: float = Field(default=0.0, ge=0)
    other_cost: float = Field(default=0.0, ge=0)
    production_hours: float = Field(default=8.0, gt=0)
    craft_complexity: str = "Medium"
    desired_margin_pct: float = Field(default=25.0, ge=5, le=200)
    demand_index: float = Field(default=1.0, ge=0.5, le=2.0)
    market_reference_price: Optional[float] = None
    shipping_cost: float = Field(default=0.0, ge=0)


class PricingAcceptRequest(BaseModel):
    prediction_id: int
    product_id: Optional[int] = None
    accepted_price: Optional[float] = None
