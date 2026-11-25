import json
from pathlib import Path
import joblib
import pandas as pd
from catboost import CatBoostRegressor

from app.core.config import STORAGE_DIR
from training.preprocessing.features import engineer_features

MODELS_DIR = STORAGE_DIR / "models"

_xgb_model = None
_cat_model = None


def _ensure_models_loaded():
    global _xgb_model, _cat_model
    xgb_path = MODELS_DIR / "pricing_xgb.joblib"
    cat_path = MODELS_DIR / "pricing_catboost.cbm"

    if not xgb_path.exists() or not cat_path.exists():
        from training.train_pricing import train_and_save
        train_and_save()

    if _xgb_model is None:
        _xgb_model = joblib.load(xgb_path)
    if _cat_model is None:
        _cat_model = CatBoostRegressor()
        _cat_model.load_model(str(cat_path))
    return _xgb_model, _cat_model


def predict_craft_price(payload: dict) -> dict:
    xgb, cat = _ensure_models_loaded()

    total_cost = (
        float(payload["material_cost"])
        + float(payload["labour_cost"])
        + float(payload.get("packaging_cost", 0.0))
        + float(payload.get("other_cost", 0.0))
    )
    row = {
        "category_name": payload["category_name"],
        "craft_complexity": payload.get("craft_complexity", "Medium"),
        "material_cost": float(payload["material_cost"]),
        "labour_cost": float(payload["labour_cost"]),
        "packaging_cost": float(payload.get("packaging_cost", 0.0)),
        "other_cost": float(payload.get("other_cost", 0.0)),
        "production_hours": float(payload.get("production_hours", 8.0)),
        "desired_margin_pct": float(payload.get("desired_margin_pct", 25.0)),
        "demand_index": float(payload.get("demand_index", 1.0)),
        "market_reference_price": payload.get("market_reference_price") or (total_cost * 1.35),
        "shipping_cost": float(payload.get("shipping_cost", 0.0)),
    }

    features = engineer_features(pd.DataFrame([row]))
    xgb_price = float(xgb.predict(features)[0])
    cat_price = float(cat.predict(features)[0])

    min_profitable = round(total_cost * 1.12, 2)
    ensemble_raw = 0.5 * xgb_price + 0.5 * cat_price
    recommended = round(max(min_profitable, ensemble_raw), 2)
    wholesale = round(max(min_profitable, recommended * 0.84), 2)
    retail = round(recommended * 1.15, 2)
    expected_profit = round(recommended - total_cost, 2)
    margin_pct = round((expected_profit / recommended) * 100.0, 2) if recommended > 0 else 0.0

    explanation = (
        f"Total production cost is ₹{total_cost:,.2f} (Material ₹{row['material_cost']:,.0f} + "
        f"Labour ₹{row['labour_cost']:,.0f} + Packaging ₹{row['packaging_cost']:,.0f} + "
        f"Other ₹{row['other_cost']:,.0f}). XGBoost predicted ₹{xgb_price:,.2f} and CatBoost "
        f"predicted ₹{cat_price:,.2f} for '{row['category_name']}' ({row['craft_complexity']} complexity, "
        f"{row['production_hours']} hrs, demand index {row['demand_index']}). "
        f"Recommended price ₹{recommended:,.2f} yields ₹{expected_profit:,.2f} profit ({margin_pct}% margin)."
    )

    return {
        "total_production_cost": round(total_cost, 2),
        "xgboost_price": round(xgb_price, 2),
        "catboost_price": round(cat_price, 2),
        "recommended_price": recommended,
        "min_profitable_price": min_profitable,
        "wholesale_price": wholesale,
        "retail_price": retail,
        "expected_profit": expected_profit,
        "profit_margin_pct": margin_pct,
        "explanation": explanation,
        "model_version": "xgb+catboost-v1",
    }
