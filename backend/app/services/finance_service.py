import io
import json
from datetime import datetime, timezone
from pathlib import Path
import qrcode
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from sqlalchemy.orm import Session

from app.core.config import STORAGE_DIR
from app.models import (
    ArtisanProfile,
    Expense,
    FinancialLedger,
    FinancialReport,
    Invoice,
    InvoiceItem,
    Order,
    OrderItem,
    PaymentRecord,
    Product,
    Transaction,
)


def compute_artisan_financial_summary(db: Session, artisan_id: int) -> dict:
    txs = db.query(Transaction).filter(Transaction.artisan_id == artisan_id).all()
    expenses = db.query(Expense).filter(Expense.artisan_id == artisan_id).all()
    payments = db.query(PaymentRecord).filter(PaymentRecord.artisan_id == artisan_id).all()
    orders = db.query(Order).filter(Order.artisan_id == artisan_id).all()

    total_revenue = sum(t.amount for t in txs if t.tx_type == "income" and t.status == "completed")
    total_expenses = sum(t.amount for t in txs if t.tx_type == "expense")
    if not total_expenses and expenses:
        total_expenses = sum(e.amount for e in expenses)

    pending_payments = sum(p.amount for p in payments if p.status == "pending")
    gross_profit = total_revenue - total_expenses
    profit_margin_pct = round((gross_profit / total_revenue) * 100.0, 2) if total_revenue > 0 else 0.0

    # Product-wise profitability from orders & products
    products = db.query(Product).filter(Product.artisan_id == artisan_id).all()
    product_map = {p.id: p for p in products}
    prod_perf = {}
    for o in orders:
        for item in o.items:
            p = product_map.get(item.product_id)
            unit_cost = (p.material_cost + p.labour_cost + p.packaging_cost + p.other_cost) if p else (item.unit_price * 0.65)
            cost_total = unit_cost * item.quantity
            rev_total = item.line_total
            entry = prod_perf.setdefault(
                item.product_title,
                {"product_id": item.product_id, "title": item.product_title, "units_sold": 0, "revenue": 0.0, "cost": 0.0, "profit": 0.0},
            )
            entry["units_sold"] += item.quantity
            entry["revenue"] += rev_total
            entry["cost"] += cost_total
            entry["profit"] += (rev_total - cost_total)

    product_profitability = sorted(prod_perf.values(), key=lambda x: x["profit"], reverse=True)

    return {
        "total_revenue": round(total_revenue, 2),
        "total_expenses": round(total_expenses, 2),
        "gross_profit": round(gross_profit, 2),
        "net_profit": round(gross_profit, 2),
        "profit_margin_pct": profit_margin_pct,
        "pending_payments": round(pending_payments, 2),
        "total_orders": len(orders),
        "product_profitability": product_profitability,
    }


def generate_upi_qr_base64(upi_id: str, payee_name: str, amount: float | None = None, note: str = "KalaiNova Order") -> str:
    import base64
    uri = f"upi://pay?pa={upi_id}&pn={payee_name.replace(' ', '%20')}&cu=INR&tn={note.replace(' ', '%20')}"
    if amount and amount > 0:
        uri += f"&am={amount:.2f}"
    qr = qrcode.make(uri)
    buf = io.BytesIO()
    qr.save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("utf-8")


def create_invoice_with_pdf(
    db: Session,
    artisan: ArtisanProfile,
    buyer_name: str,
    buyer_location: str | None,
    items: list[dict],
    tax_rate_pct: float = 5.0,
    order_id: int | None = None,
) -> Invoice:
    inv_num = f"KN-INV-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"
    subtotal = round(sum(i["quantity"] * i["unit_price"] for i in items), 2)
    tax_amount = round(subtotal * (tax_rate_pct / 100.0), 2)
    total_amount = round(subtotal + tax_amount, 2)

    pdf_filename = f"{inv_num}.pdf"
    pdf_path = STORAGE_DIR / "invoices" / pdf_filename

    c = canvas.Canvas(str(pdf_path), pagesize=A4)
    w, h = A4
    c.setFont("Helvetica-Bold", 18)
    c.drawString(20 * mm, h - 25 * mm, "KALAINOVA — TAX INVOICE")
    c.setFont("Helvetica", 10)
    c.drawString(20 * mm, h - 33 * mm, f"Invoice No: {inv_num}")
    c.drawString(20 * mm, h - 39 * mm, f"Date: {datetime.now(timezone.utc).strftime('%d %b %Y')}")
    c.drawString(20 * mm, h - 48 * mm, f"Artisan: {artisan.user.full_name} ({artisan.business_type})")
    c.drawString(20 * mm, h - 54 * mm, f"Location: {artisan.location} | UPI: {artisan.upi_id or 'N/A'}")
    c.drawString(20 * mm, h - 64 * mm, f"Billed To: {buyer_name} ({buyer_location or 'India'})")

    y = h - 80 * mm
    c.setFont("Helvetica-Bold", 10)
    c.drawString(20 * mm, y, "Item")
    c.drawString(115 * mm, y, "Qty")
    c.drawString(135 * mm, y, "Rate (INR)")
    c.drawString(168 * mm, y, "Amount (INR)")
    y -= 6 * mm
    c.line(20 * mm, y, 190 * mm, y)
    y -= 7 * mm

    c.setFont("Helvetica", 10)
    for it in items:
        line_total = round(it["quantity"] * it["unit_price"], 2)
        c.drawString(20 * mm, y, str(it["description"])[:48])
        c.drawString(115 * mm, y, str(it["quantity"]))
        c.drawString(135 * mm, y, f"{it['unit_price']:,.2f}")
        c.drawString(168 * mm, y, f"{line_total:,.2f}")
        y -= 7 * mm

    y -= 6 * mm
    c.line(115 * mm, y, 190 * mm, y)
    y -= 7 * mm
    c.drawString(135 * mm, y, "Subtotal:")
    c.drawString(168 * mm, y, f"INR {subtotal:,.2f}")
    y -= 6 * mm
    c.drawString(135 * mm, y, f"Tax ({tax_rate_pct}%):")
    c.drawString(168 * mm, y, f"INR {tax_amount:,.2f}")
    y -= 7 * mm
    c.setFont("Helvetica-Bold", 11)
    c.drawString(135 * mm, y, "Total:")
    c.drawString(168 * mm, y, f"INR {total_amount:,.2f}")
    c.save()

    inv = Invoice(
        invoice_number=inv_num,
        artisan_id=artisan.id,
        order_id=order_id,
        buyer_name=buyer_name,
        buyer_location=buyer_location,
        subtotal=subtotal,
        tax_amount=tax_amount,
        total_amount=total_amount,
        pdf_url=f"/storage/invoices/{pdf_filename}",
        status="issued",
    )
    db.add(inv)
    db.flush()

    for it in items:
        db.add(
            InvoiceItem(
                invoice_id=inv.id,
                description=it["description"],
                quantity=it["quantity"],
                unit_price=it["unit_price"],
                line_total=round(it["quantity"] * it["unit_price"], 2),
            )
        )
    db.commit()
    db.refresh(inv)
    return inv


def build_financial_readiness_report(db: Session, artisan: ArtisanProfile) -> dict:
    summary = compute_artisan_financial_summary(db, artisan.id)
    has_bank = bool(artisan.bank_account_masked)
    has_upi = bool(artisan.upi_id)
    has_revenue = summary["total_revenue"] > 0
    is_shg_or_coop = artisan.business_type in ("SHG", "Cooperative")

    score = 35
    if has_bank:
        score += 20
    if has_upi:
        score += 15
    if has_revenue:
        score += 20
    if artisan.experience_years >= 2:
        score += 10

    checklist = [
        {"document": "Aadhaar & Artisan Identity (PM Vishwakarma / Artisan ID)", "ready": True},
        {"document": "Bank Account & IFSC Verification", "ready": has_bank},
        {"document": "Active UPI Business Handle", "ready": has_upi},
        {"document": "Digital Sales & Ledger History", "ready": has_revenue},
        {"document": "SHG / Cooperative Registration (if applicable)", "ready": bool(artisan.shg_group_id) or not is_shg_or_coop},
    ]

    schemes = [
        {
            "scheme_name": "PM Vishwakarma Scheme",
            "eligibility_status": "Likely Eligible (Pre-screened)" if artisan.experience_years >= 1 else "Needs Review",
            "benefits": "Collateral-free credit support up to ₹1–2 lakh at concessional interest + toolkit grant & skill training.",
            "disclaimer": "Pre-screening is informational based on public criteria; final approval rests with the implementing bank/portal.",
        },
        {
            "scheme_name": "Pradhan Mantri MUDRA Yojana (Shishu / Kishore)",
            "eligibility_status": "Likely Eligible (Pre-screened)" if has_bank else "Complete Bank Setup First",
            "benefits": "Micro-enterprise working capital loans (Shishu up to ₹50,000; Kishore up to ₹5 lakh).",
            "disclaimer": "Subject to bank KYC and credit appraisal.",
        },
        {
            "scheme_name": "DAY-NRLM SHG Revolving Fund & Credit Linkage",
            "eligibility_status": "Recommended" if is_shg_or_coop else "Applicable for SHG Members",
            "benefits": "Community investment & low-interest SHG bank linkage for women-led craft collectives.",
            "disclaimer": "Requires active SHG membership and regular book-keeping.",
        },
    ]

    report_data = {
        "readiness_score": score,
        "financial_summary": summary,
        "document_checklist": checklist,
        "eligible_schemes": schemes,
        "notice": "KalaiNova provides financial readiness guidance only and does not guarantee loan approval or make lending decisions.",
    }

    db.add(
        FinancialReport(
            artisan_id=artisan.id,
            report_type="readiness_report",
            period_label=datetime.now(timezone.utc).strftime("%Y-%m"),
            total_revenue=summary["total_revenue"],
            total_expenses=summary["total_expenses"],
            net_profit=summary["net_profit"],
            summary_json=json.dumps(report_data),
        )
    )
    db.commit()
    return report_data
