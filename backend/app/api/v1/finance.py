from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import require_artisan
from app.database.session import get_db
from app.models import (
    ArtisanProfile,
    Expense,
    FinancialLedger,
    Invoice,
    Order,
    PaymentRecord,
    Transaction,
    User,
)
from app.schemas.marketplace_finance import ExpenseCreate, InvoiceCreate, PaymentRecordCreate, TransactionCreate
from app.services.finance_service import (
    build_financial_readiness_report,
    compute_artisan_financial_summary,
    create_invoice_with_pdf,
    generate_upi_qr_base64,
)

router = APIRouter(prefix="/finance", tags=["FinTech & Finance"])


def _get_artisan(user: User, db: Session) -> ArtisanProfile:
    ap = db.query(ArtisanProfile).filter(ArtisanProfile.user_id == user.id).first()
    if not ap:
        ap = db.query(ArtisanProfile).first()
    if not ap:
        raise HTTPException(status_code=404, detail="Artisan profile not found")
    return ap


@router.get("/dashboard")
def finance_dashboard(current_user: User = Depends(require_artisan), db: Session = Depends(get_db)):
    artisan = _get_artisan(current_user, db)
    summary = compute_artisan_financial_summary(db, artisan.id)
    recent_tx = (
        db.query(Transaction)
        .filter(Transaction.artisan_id == artisan.id)
        .order_by(Transaction.tx_date.desc())
        .limit(10)
        .all()
    )
    return {
        **summary,
        "upi_id": artisan.upi_id,
        "bank_name": artisan.bank_name,
        "bank_account_masked": artisan.bank_account_masked,
        "recent_transactions": [
            {
                "id": t.id,
                "tx_type": t.tx_type,
                "category": t.category,
                "amount": t.amount,
                "description": t.description,
                "status": t.status,
                "tx_date": t.tx_date.isoformat() if t.tx_date else None,
            }
            for t in recent_tx
        ],
    }


@router.get("/ledger")
def get_ledger(current_user: User = Depends(require_artisan), db: Session = Depends(get_db)):
    artisan = _get_artisan(current_user, db)
    entries = (
        db.query(FinancialLedger)
        .filter(FinancialLedger.artisan_id == artisan.id)
        .order_by(FinancialLedger.id.desc())
        .all()
    )
    return [
        {
            "id": e.id,
            "entry_type": e.entry_type,
            "category": e.category,
            "amount": e.amount,
            "balance_after": e.balance_after,
            "narration": e.narration,
            "entry_date": e.entry_date.isoformat() if e.entry_date else None,
        }
        for e in entries
    ]


@router.post("/transactions", status_code=status.HTTP_201_CREATED)
def record_transaction(
    payload: TransactionCreate,
    current_user: User = Depends(require_artisan),
    db: Session = Depends(get_db),
):
    artisan = _get_artisan(current_user, db)
    tx = Transaction(
        artisan_id=artisan.id,
        order_id=payload.order_id,
        tx_type=payload.tx_type,
        category=payload.category,
        amount=payload.amount,
        description=payload.description,
        reference_id=payload.reference_id,
        status="completed",
    )
    db.add(tx)
    last_entry = (
        db.query(FinancialLedger)
        .filter(FinancialLedger.artisan_id == artisan.id)
        .order_by(FinancialLedger.id.desc())
        .first()
    )
    prev_bal = last_entry.balance_after if last_entry else 0.0
    new_bal = prev_bal + payload.amount if payload.tx_type == "income" else prev_bal - payload.amount
    db.add(
        FinancialLedger(
            artisan_id=artisan.id,
            entry_type="credit" if payload.tx_type == "income" else "debit",
            category=payload.category,
            amount=payload.amount,
            balance_after=round(new_bal, 2),
            reference_type="order" if payload.order_id else "manual",
            reference_id=payload.order_id,
            narration=payload.description or f"{payload.tx_type}: {payload.category}",
        )
    )
    db.commit()
    db.refresh(tx)
    return {"id": tx.id, "tx_type": tx.tx_type, "amount": tx.amount, "balance_after": round(new_bal, 2)}


@router.post("/expenses", status_code=status.HTTP_201_CREATED)
def record_expense(
    payload: ExpenseCreate,
    current_user: User = Depends(require_artisan),
    db: Session = Depends(get_db),
):
    artisan = _get_artisan(current_user, db)
    exp = Expense(
        artisan_id=artisan.id,
        product_id=payload.product_id,
        category=payload.category,
        amount=payload.amount,
        notes=payload.notes,
    )
    db.add(exp)
    db.add(
        Transaction(
            artisan_id=artisan.id,
            tx_type="expense",
            category=payload.category,
            amount=payload.amount,
            description=payload.notes or payload.category,
            status="completed",
        )
    )
    last_entry = (
        db.query(FinancialLedger)
        .filter(FinancialLedger.artisan_id == artisan.id)
        .order_by(FinancialLedger.id.desc())
        .first()
    )
    prev_bal = last_entry.balance_after if last_entry else 0.0
    new_bal = round(prev_bal - payload.amount, 2)
    db.add(
        FinancialLedger(
            artisan_id=artisan.id,
            entry_type="debit",
            category=payload.category,
            amount=payload.amount,
            balance_after=new_bal,
            reference_type="expense",
            narration=payload.notes or f"Expense: {payload.category}",
        )
    )
    db.commit()
    db.refresh(exp)
    return {"id": exp.id, "category": exp.category, "amount": exp.amount, "balance_after": new_bal}


@router.get("/profitability")
def get_profitability(current_user: User = Depends(require_artisan), db: Session = Depends(get_db)):
    artisan = _get_artisan(current_user, db)
    return compute_artisan_financial_summary(db, artisan.id)


@router.get("/invoices")
def list_invoices(current_user: User = Depends(require_artisan), db: Session = Depends(get_db)):
    artisan = _get_artisan(current_user, db)
    rows = db.query(Invoice).filter(Invoice.artisan_id == artisan.id).order_by(Invoice.id.desc()).all()
    return [
        {
            "id": i.id,
            "invoice_number": i.invoice_number,
            "buyer_name": i.buyer_name,
            "subtotal": i.subtotal,
            "tax_amount": i.tax_amount,
            "total_amount": i.total_amount,
            "pdf_url": i.pdf_url,
            "status": i.status,
            "issued_at": i.issued_at.isoformat() if i.issued_at else None,
        }
        for i in rows
    ]


@router.post("/invoices", status_code=status.HTTP_201_CREATED)
def generate_invoice(
    payload: InvoiceCreate,
    current_user: User = Depends(require_artisan),
    db: Session = Depends(get_db),
):
    artisan = _get_artisan(current_user, db)
    inv = create_invoice_with_pdf(
        db=db,
        artisan=artisan,
        buyer_name=payload.buyer_name,
        buyer_location=payload.buyer_location,
        items=[it.model_dump() for it in payload.items],
        tax_rate_pct=payload.tax_rate_pct,
        order_id=payload.order_id,
    )
    return {
        "id": inv.id,
        "invoice_number": inv.invoice_number,
        "subtotal": inv.subtotal,
        "tax_amount": inv.tax_amount,
        "total_amount": inv.total_amount,
        "pdf_url": inv.pdf_url,
        "status": inv.status,
    }


@router.get("/payments")
def list_payments(current_user: User = Depends(require_artisan), db: Session = Depends(get_db)):
    artisan = _get_artisan(current_user, db)
    rows = db.query(PaymentRecord).filter(PaymentRecord.artisan_id == artisan.id).order_by(PaymentRecord.id.desc()).all()
    return [
        {
            "id": p.id,
            "order_id": p.order_id,
            "amount": p.amount,
            "payment_method": p.payment_method,
            "upi_reference": p.upi_reference,
            "status": p.status,
            "paid_at": p.paid_at.isoformat() if p.paid_at else None,
        }
        for p in rows
    ]


@router.post("/payments", status_code=status.HTTP_201_CREATED)
def record_payment(
    payload: PaymentRecordCreate,
    current_user: User = Depends(require_artisan),
    db: Session = Depends(get_db),
):
    artisan = _get_artisan(current_user, db)
    order = db.query(Order).filter(Order.id == payload.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    pay = PaymentRecord(
        order_id=order.id,
        artisan_id=artisan.id,
        amount=payload.amount,
        payment_method=payload.payment_method,
        upi_reference=payload.upi_reference,
        status=payload.status,
        paid_at=datetime.now(timezone.utc) if payload.status == "paid" else None,
    )
    db.add(pay)
    if payload.status == "paid":
        order.payment_status = "paid"
        db.add(
            Transaction(
                artisan_id=artisan.id,
                order_id=order.id,
                tx_type="income",
                category="Order Payment",
                amount=payload.amount,
                description=f"Payment for order {order.order_number}",
                reference_id=payload.upi_reference,
                status="completed",
            )
        )
        last_entry = (
            db.query(FinancialLedger)
            .filter(FinancialLedger.artisan_id == artisan.id)
            .order_by(FinancialLedger.id.desc())
            .first()
        )
        prev_bal = last_entry.balance_after if last_entry else 0.0
        db.add(
            FinancialLedger(
                artisan_id=artisan.id,
                entry_type="credit",
                category="Order Payment",
                amount=payload.amount,
                balance_after=round(prev_bal + payload.amount, 2),
                reference_type="order",
                reference_id=order.id,
                narration=f"Payment received for {order.order_number} ({payload.payment_method})",
            )
        )
    db.commit()
    db.refresh(pay)
    return {"id": pay.id, "order_id": pay.order_id, "amount": pay.amount, "status": pay.status}


@router.get("/payments/qr")
def get_upi_qr(
    amount: float | None = Query(None, gt=0),
    current_user: User = Depends(require_artisan),
    db: Session = Depends(get_db),
):
    artisan = _get_artisan(current_user, db)
    if not artisan.upi_id:
        raise HTTPException(status_code=400, detail="UPI ID not registered in artisan profile")
    qr_data_url = generate_upi_qr_base64(artisan.upi_id, current_user.full_name, amount=amount)
    return {"upi_id": artisan.upi_id, "qr_data_url": qr_data_url, "amount": amount}


@router.get("/reports")
def get_financial_readiness_report(
    current_user: User = Depends(require_artisan),
    db: Session = Depends(get_db),
):
    artisan = _get_artisan(current_user, db)
    return build_financial_readiness_report(db, artisan)
