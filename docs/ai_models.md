# KALAINOVA — AI & ML Models Documentation

## Model Registry Summary

| Model | Source | License | Task | Status / Fallback |
|---|---|---|---|---|
| **OpenCV Studio** | `opencv-python-headless` | Apache-2.0 | White balance, CLAHE lighting, unsharp sharpening | Ready (CPU) |
| **BiRefNet** | `ZhengPeng7/BiRefNet_lite` | MIT | Salient object background removal | Ready (GPU/CPU); explicit unavailable state if offline |
| **IndicConformer** | `ai4bharat/indic-conformer-600m-multilingual` | MIT | Multilingual Indian ASR (ta, hi, te, kn, ml, en) | Adapter configured (`ENABLE_LOCAL_SPEECH` + `HF_TOKEN`) |
| **IndicTrans2** | `ai4bharat/indictrans2-indic-en-dist-200M` | MIT | Indic-to-English/Hindi translation | Adapter configured (`ENABLE_LOCAL_TRANSLATION`) |
| **Multilingual LLM** | OpenAI / Gemini via ENV | Provider | Structured EN/HI catalogue generation | Configurable via `LLM_PROVIDER`; deterministic extractor fallback |
| **XGBoost + CatBoost** | Trained on `craft_pricing_dataset.csv` | MIT / Apache-2.0 | Dynamic craft pricing ensemble | Trained & persisted in `backend/storage/models/` |
| **SentenceTransformer** | `sentence-transformers/all-MiniLM-L6-v2` | Apache-2.0 | Semantic buyer-product matching | Ready (CPU) with TF-IDF cosine fallback |

> **Prototype Data Notice**: `backend/training/datasets/craft_pricing_dataset.csv` is a clearly labelled synthetic prototype dataset generated for training and demonstrating XGBoost & CatBoost pricing models. It does not represent live market prices.
