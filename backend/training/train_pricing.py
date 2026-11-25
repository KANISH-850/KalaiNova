import json
from pathlib import Path
import sys

import joblib
import numpy as np
import pandas as pd
from catboost import CatBoostRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from xgboost import XGBRegressor

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from training.datasets.generate_pricing_dataset import generate_dataset
from training.preprocessing.features import engineer_features

DATASET_PATH = BACKEND_DIR / "training" / "datasets" / "craft_pricing_dataset.csv"
MODELS_DIR = BACKEND_DIR / "storage" / "models"


def train_and_save() -> dict:
    if not DATASET_PATH.exists():
        generate_dataset(DATASET_PATH)

    df = pd.read_csv(DATASET_PATH)
    X = engineer_features(df)
    y = df["target_selling_price"].astype(float)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    xgb = XGBRegressor(
        n_estimators=200,
        max_depth=5,
        learning_rate=0.06,
        subsample=0.9,
        colsample_bytree=0.9,
        random_state=42,
    )
    xgb.fit(X_train, y_train)
    xgb_pred = xgb.predict(X_test)

    cat = CatBoostRegressor(
        iterations=250,
        depth=5,
        learning_rate=0.06,
        random_seed=42,
        verbose=0,
    )
    cat.fit(X_train, y_train)
    cat_pred = cat.predict(X_test)

    ens_pred = 0.5 * xgb_pred + 0.5 * cat_pred

    metrics = {
        "dataset": str(DATASET_PATH.name),
        "is_synthetic_prototype_data": True,
        "train_samples": int(len(X_train)),
        "test_samples": int(len(X_test)),
        "xgboost": {
            "mae": round(float(mean_absolute_error(y_test, xgb_pred)), 2),
            "rmse": round(float(np.sqrt(mean_squared_error(y_test, xgb_pred))), 2),
            "r2": round(float(r2_score(y_test, xgb_pred)), 4),
        },
        "catboost": {
            "mae": round(float(mean_absolute_error(y_test, cat_pred)), 2),
            "rmse": round(float(np.sqrt(mean_squared_error(y_test, cat_pred))), 2),
            "r2": round(float(r2_score(y_test, cat_pred)), 4),
        },
        "ensemble": {
            "mae": round(float(mean_absolute_error(y_test, ens_pred)), 2),
            "rmse": round(float(np.sqrt(mean_squared_error(y_test, ens_pred))), 2),
            "r2": round(float(r2_score(y_test, ens_pred)), 4),
        },
    }

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(xgb, MODELS_DIR / "pricing_xgb.joblib")
    cat.save_model(str(MODELS_DIR / "pricing_catboost.cbm"))
    (MODELS_DIR / "pricing_metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    return metrics


if __name__ == "__main__":
    results = train_and_save()
    print(json.dumps(results, indent=2))
