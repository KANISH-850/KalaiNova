"""
Generates a clearly labelled synthetic prototype dataset for artisan craft pricing.
NOTE: This is synthetic prototype data for model training & demonstration when genuine
regional craft market datasets are unavailable. It does not represent live market prices.
"""
from pathlib import Path
import numpy as np
import pandas as pd

CATEGORIES = [
    "Handloom & Textiles",
    "Folk Paintings",
    "Terracotta & Pottery",
    "Handmade Jewellery",
    "Bamboo & Cane Craft",
]
COMPLEXITIES = ["Low", "Medium", "High", "Heritage"]


def generate_dataset(output_csv: Path, n_samples: int = 1200, seed: int = 42) -> Path:
    rng = np.random.default_rng(seed)
    rows = []
    for _ in range(n_samples):
        cat = rng.choice(CATEGORIES)
        comp = rng.choice(COMPLEXITIES, p=[0.2, 0.4, 0.25, 0.15])
        comp_mult = {"Low": 1.0, "Medium": 1.25, "High": 1.55, "Heritage": 1.95}[comp]

        if cat == "Handloom & Textiles":
            mat = rng.uniform(600, 4500)
            hours = rng.uniform(10, 60)
        elif cat == "Folk Paintings":
            mat = rng.uniform(200, 1500)
            hours = rng.uniform(6, 35)
        elif cat == "Terracotta & Pottery":
            mat = rng.uniform(80, 600)
            hours = rng.uniform(2, 16)
        elif cat == "Handmade Jewellery":
            mat = rng.uniform(120, 1200)
            hours = rng.uniform(3, 18)
        else:
            mat = rng.uniform(90, 700)
            hours = rng.uniform(2, 14)

        labour = hours * rng.uniform(45, 95) * (0.85 + 0.15 * comp_mult)
        packaging = rng.uniform(30, 220)
        other = rng.uniform(20, 180)
        shipping = rng.uniform(40, 250)
        total_cost = mat + labour + packaging + other

        desired_margin_pct = rng.uniform(15, 55)
        demand_index = rng.uniform(0.8, 1.45)
        market_ref = total_cost * comp_mult * rng.uniform(1.15, 1.45)

        # Target fair selling price
        base_price = total_cost * (1 + desired_margin_pct / 100.0)
        market_blend = 0.65 * base_price + 0.35 * (market_ref * demand_index)
        noise = rng.normal(0, total_cost * 0.03)
        target_price = max(total_cost * 1.12, market_blend + noise)

        rows.append({
            "category_name": cat,
            "craft_complexity": comp,
            "material_cost": round(float(mat), 2),
            "labour_cost": round(float(labour), 2),
            "packaging_cost": round(float(packaging), 2),
            "other_cost": round(float(other), 2),
            "production_hours": round(float(hours), 2),
            "desired_margin_pct": round(float(desired_margin_pct), 2),
            "demand_index": round(float(demand_index), 3),
            "market_reference_price": round(float(market_ref), 2),
            "shipping_cost": round(float(shipping), 2),
            "total_production_cost": round(float(total_cost), 2),
            "target_selling_price": round(float(target_price), 2),
            "is_synthetic_prototype_data": True,
        })

    df = pd.DataFrame(rows)
    output_csv.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_csv, index=False)
    return output_csv


if __name__ == "__main__":
    out = Path(__file__).resolve().parent / "craft_pricing_dataset.csv"
    generate_dataset(out)
    print(f"Generated synthetic craft pricing dataset at {out}")
