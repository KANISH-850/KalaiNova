import numpy as np
import pandas as pd

CATEGORY_MAP = {
    "Handloom & Textiles": 0,
    "Folk Paintings": 1,
    "Terracotta & Pottery": 2,
    "Handmade Jewellery": 3,
    "Bamboo & Cane Craft": 4,
}

COMPLEXITY_MAP = {
    "Low": 1,
    "Medium": 2,
    "High": 3,
    "Heritage": 4,
}

FEATURE_COLUMNS = [
    "category_idx",
    "complexity_idx",
    "material_cost",
    "labour_cost",
    "packaging_cost",
    "other_cost",
    "production_hours",
    "desired_margin_pct",
    "demand_index",
    "market_reference_price",
    "shipping_cost",
    "total_production_cost",
    "labour_share",
]


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    out = pd.DataFrame()
    out["category_idx"] = df["category_name"].map(lambda x: CATEGORY_MAP.get(x, 0)).astype(int)
    out["complexity_idx"] = df["craft_complexity"].map(lambda x: COMPLEXITY_MAP.get(x, 2)).astype(int)
    out["material_cost"] = df["material_cost"].astype(float)
    out["labour_cost"] = df["labour_cost"].astype(float)
    out["packaging_cost"] = df["packaging_cost"].astype(float)
    out["other_cost"] = df["other_cost"].astype(float)
    out["production_hours"] = df["production_hours"].astype(float)
    out["desired_margin_pct"] = df["desired_margin_pct"].astype(float)
    out["demand_index"] = df["demand_index"].astype(float)

    total_cost = (
        out["material_cost"] + out["labour_cost"] + out["packaging_cost"] + out["other_cost"]
    )
    out["total_production_cost"] = total_cost
    out["market_reference_price"] = df["market_reference_price"].fillna(total_cost * 1.35).astype(float)
    out["shipping_cost"] = df["shipping_cost"].astype(float)
    out["labour_share"] = np.where(total_cost > 0, out["labour_cost"] / total_cost, 0.0)
    return out[FEATURE_COLUMNS]
