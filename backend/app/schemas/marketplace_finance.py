from typing import List, Optional
from pydantic import BaseModel, Field


class BuyerMatchRequest(BaseModel):
    query: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    max_price: Optional[float] = None
    min_quantity: Optional[int] = 1
    top_k: int = Field(default=10, ge=1, le=50)


class EnquiryCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., ge=1)
    offered_price_per_unit: Optional[float] = None
    message: str = Field(..., min_length=3)


class EnquiryUpdate(BaseModel):
    status: str = Field(..., pattern="^(pending|negotiating|accepted|rejected)$")


class OrderItemInput(BaseModel):
    product_id: int
    quantity: int = Field(..., ge=1)
    unit_price: Optional[float] = None


class OrderCreate(BaseModel):
    artisan_id: int
    items: List[OrderItemInput]
    shipping_address: Optional[str] = None


class TransactionCreate(BaseModel):
    tx_type: str = Field(..., pattern="^(income|expense)$")
    category: str
    amount: float = Field(..., gt=0)
    description: Optional[str] = None
    reference_id: Optional[str] = None
    order_id: Optional[int] = None


class ExpenseCreate(BaseModel):
    product_id: Optional[int] = None
    category: str
    amount: float = Field(..., gt=0)
    notes: Optional[str] = None


class InvoiceItemInput(BaseModel):
    description: str
    quantity: int = Field(..., ge=1)
    unit_price: float = Field(..., gt=0)


class InvoiceCreate(BaseModel):
    order_id: Optional[int] = None
    buyer_name: str
    buyer_location: Optional[str] = None
    tax_rate_pct: float = Field(default=5.0, ge=0, le=28)
    items: List[InvoiceItemInput]


class PaymentRecordCreate(BaseModel):
    order_id: int
    amount: float = Field(..., gt=0)
    payment_method: str = "UPI"
    upi_reference: Optional[str] = None
    status: str = Field(default="paid", pattern="^(pending|paid|failed)$")


class AgentQueryRequest(BaseModel):
    message: str = Field(..., min_length=1)
    product_id: Optional[int] = None
    confirm_action_id: Optional[int] = None
