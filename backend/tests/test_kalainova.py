import io
import os
import sys
from pathlib import Path

from fastapi.testclient import TestClient
from PIL import Image
import pytest

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

os.environ["DATABASE_URL"] = "sqlite:///./test_kalainova.db"
os.environ["ENABLE_LOCAL_BIREFNET"] = "false"
os.environ["ENABLE_LOCAL_EMBEDDINGS"] = "false"

from app.main import app


@pytest.fixture(scope="module")
def client():
    test_db = BACKEND_DIR / "test_kalainova.db"
    if test_db.exists():
        test_db.unlink()
    with TestClient(app) as c:
        yield c
    if test_db.exists():
        test_db.unlink()


def _login(client: TestClient, identifier: str, password: str = "Kalai@123") -> str:
    res = client.post("/api/v1/auth/login", json={"identifier": identifier, "password": password})
    assert res.status_code == 200, res.text
    return res.json()["access_token"]


def test_health(client: TestClient):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_auth_and_rbac(client: TestClient):
    artisan_token = _login(client, "kavitha.weaver@kalainova.demo")
    buyer_token = _login(client, "ananya.boutique@kalainova.demo")
    admin_token = _login(client, "admin@kalainova.demo")

    # Artisan cannot access admin dashboard
    res = client.get("/api/v1/admin/dashboard", headers={"Authorization": f"Bearer {artisan_token}"})
    assert res.status_code == 403

    # Buyer cannot access artisan finance dashboard
    res = client.get("/api/v1/finance/dashboard", headers={"Authorization": f"Bearer {buyer_token}"})
    assert res.status_code == 403

    # Admin can access admin dashboard with real DB counts
    res = client.get("/api/v1/admin/dashboard", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["total_artisans"] >= 5
    assert data["total_products"] >= 5


def test_register_and_product_crud(client: TestClient):
    reg = client.post(
        "/api/v1/auth/register",
        json={
            "email": "new.weaver@test.in",
            "password": "Password123!",
            "full_name": "Meena Weaver",
            "role": "artisan",
            "preferred_language": "ta",
            "craft_category": "Handloom & Textiles",
            "location": "Salem, Tamil Nadu",
            "upi_id": "meena@okaxis",
        },
    )
    assert reg.status_code == 201, reg.text
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create product
    prod_res = client.post(
        "/api/v1/products",
        headers=headers,
        json={
            "title": "Salem Handloom Cotton Saree",
            "category_name": "Handloom & Textiles",
            "description": "Soft handwoven cotton saree",
            "material_cost": 500,
            "labour_cost": 300,
            "packaging_cost": 50,
            "other_cost": 50,
            "selling_price": 1450,
            "stock_quantity": 10,
        },
    )
    assert prod_res.status_code == 201, prod_res.text
    pid = prod_res.json()["id"]

    # Update product
    upd = client.put(f"/api/v1/products/{pid}", headers=headers, json={"selling_price": 1500})
    assert upd.status_code == 200
    assert upd.json()["selling_price"] == 1500

    # Delete product
    dele = client.delete(f"/api/v1/products/{pid}", headers=headers)
    assert dele.status_code == 204


def test_opencv_image_enhance_and_birefnet_status(client: TestClient):
    token = _login(client, "kavitha.weaver@kalainova.demo")
    headers = {"Authorization": f"Bearer {token}"}

    buf = io.BytesIO()
    Image.new("RGB", (200, 200), (180, 120, 90)).save(buf, format="PNG")
    buf.seek(0)

    res = client.post(
        "/api/v1/ai/image/enhance",
        headers=headers,
        files={"file": ("craft.png", buf, "image/png")},
    )
    assert res.status_code == 200, res.text
    assert res.json()["enhanced_url"].startswith("/storage/processed/enh_")

    buf.seek(0)
    bg_res = client.post(
        "/api/v1/ai/image/remove-background",
        headers=headers,
        files={"file": ("craft.png", buf, "image/png")},
    )
    assert bg_res.status_code == 200
    # When local BiRefNet is disabled in test env, it explicitly reports unavailable rather than faking
    assert bg_res.json()["status"] == "unavailable"


def test_dynamic_pricing_xgboost_catboost(client: TestClient):
    token = _login(client, "kavitha.weaver@kalainova.demo")
    headers = {"Authorization": f"Bearer {token}"}

    res = client.post(
        "/api/v1/ai/pricing/predict",
        headers=headers,
        json={
            "category_name": "Handloom & Textiles",
            "material_cost": 500,
            "labour_cost": 300,
            "packaging_cost": 50,
            "other_cost": 50,
            "production_hours": 10,
            "craft_complexity": "Medium",
            "desired_margin_pct": 30,
        },
    )
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["total_production_cost"] == 900.0
    assert data["recommended_price"] >= data["min_profitable_price"]
    assert data["xgboost_price"] > 0
    assert data["catboost_price"] > 0


def test_marketplace_matching_and_enquiry(client: TestClient):
    buyer_token = _login(client, "ananya.boutique@kalainova.demo")
    headers = {"Authorization": f"Bearer {buyer_token}"}

    match_res = client.post(
        "/api/v1/marketplace/match-buyers",
        json={"query": "kanchipuram silk saree zari", "top_k": 3},
    )
    assert match_res.status_code == 200
    items = match_res.json()
    assert len(items) >= 1
    assert "Kanchipuram" in items[0]["title"]

    enq_res = client.post(
        "/api/v1/marketplace/enquiries",
        headers=headers,
        json={
            "product_id": items[0]["id"],
            "quantity": 15,
            "message": "Bulk order enquiry for wedding season",
        },
    )
    assert enq_res.status_code == 201


def test_finance_ledger_invoice_qr_and_agents(client: TestClient):
    token = _login(client, "kavitha.weaver@kalainova.demo")
    headers = {"Authorization": f"Bearer {token}"}

    dash = client.get("/api/v1/finance/dashboard", headers=headers)
    assert dash.status_code == 200
    assert dash.json()["total_revenue"] >= 17000.0

    inv = client.post(
        "/api/v1/finance/invoices",
        headers=headers,
        json={
            "buyer_name": "Deccan Heritage Boutique",
            "buyer_location": "Bengaluru",
            "tax_rate_pct": 5.0,
            "items": [{"description": "Kanchipuram Pure Silk Saree", "quantity": 1, "unit_price": 8500}],
        },
    )
    assert inv.status_code == 201, inv.text
    assert inv.json()["pdf_url"].endswith(".pdf")

    qr = client.get("/api/v1/finance/payments/qr?amount=8500", headers=headers)
    assert qr.status_code == 200
    assert qr.json()["qr_data_url"].startswith("data:image/png;base64,")

    rep = client.get("/api/v1/finance/reports", headers=headers)
    assert rep.status_code == 200
    assert rep.json()["readiness_score"] >= 50

    agent_fin = client.post(
        "/api/v1/agents/finance",
        headers=headers,
        json={"message": "Which of my products generated the highest profit this month?"},
    )
    assert agent_fin.status_code == 200
    assert "Kanchipuram" in agent_fin.json()["response"]
