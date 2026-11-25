import json
from pathlib import Path

MODELS_DIR = Path(__file__).resolve().parents[1] / "storage" / "models"


def evaluate() -> dict:
    metrics_file = MODELS_DIR / "pricing_metrics.json"
    if not metrics_file.exists():
        raise FileNotFoundError("Models not trained yet. Run training/train_pricing.py first.")
    return json.loads(metrics_file.read_text(encoding="utf-8"))


if __name__ == "__main__":
    print(json.dumps(evaluate(), indent=2))
