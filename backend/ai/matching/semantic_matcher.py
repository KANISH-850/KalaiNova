import os
from typing import List, Optional
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.core.config import settings
from ai.common.registry import ModelRegistry

os.environ.setdefault("HF_HOME", settings.HF_HOME)

_st_model = None
_st_attempted = False


def _get_st_model():
    global _st_model, _st_attempted
    if _st_model is not None or _st_attempted:
        return _st_model
    _st_attempted = True
    if not settings.ENABLE_LOCAL_EMBEDDINGS:
        ModelRegistry.update_status("SentenceTransformer-MiniLM", "disabled", "Using TF-IDF fallback")
        return None
    try:
        from sentence_transformers import SentenceTransformer

        _st_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        ModelRegistry.update_status("SentenceTransformer-MiniLM", "loaded", "all-MiniLM-L6-v2 active")
        return _st_model
    except Exception as exc:
        ModelRegistry.update_status("SentenceTransformer-MiniLM", "fallback_tfidf", f"Unavailable ({exc}); using TF-IDF")
        return None


def score_products_for_buyer(
    products: List[dict],
    query: Optional[str] = None,
    category: Optional[str] = None,
    location: Optional[str] = None,
    max_price: Optional[float] = None,
    min_quantity: int = 1,
) -> List[dict]:
    if not products:
        return []

    corpus = [
        f"{p['title']} {p['category_name']} {p['description']} {p.get('tags', '')} {p.get('artisan_location', '')}"
        for p in products
    ]

    semantic_scores = np.ones(len(products), dtype=float) * 0.65
    engine_used = "metadata_weighted"

    if query and query.strip():
        model = _get_st_model()
        if model is not None:
            q_emb = model.encode([query], normalize_embeddings=True)
            p_embs = model.encode(corpus, normalize_embeddings=True)
            semantic_scores = np.clip((p_embs @ q_emb.T).flatten(), 0.0, 1.0)
            engine_used = "sentence-transformers/all-MiniLM-L6-v2"
        else:
            vec = TfidfVectorizer(stop_words="english")
            mat = vec.fit_transform([query] + corpus)
            semantic_scores = cosine_similarity(mat[0:1], mat[1:]).flatten()
            engine_used = "tfidf_cosine_fallback"

    ranked = []
    for idx, p in enumerate(products):
        sem = float(semantic_scores[idx])
        cat_bonus = 1.0 if (not category or category.lower() in p["category_name"].lower()) else 0.25
        loc_bonus = 1.0 if (not location or location.lower() in (p.get("artisan_location") or "").lower()) else 0.55
        price_bonus = 1.0 if (not max_price or p["selling_price"] <= max_price) else max(0.1, max_price / max(p["selling_price"], 1.0))
        qty_bonus = 1.0 if p.get("stock_quantity", 1) >= min_quantity else 0.4

        score = round(0.45 * sem + 0.20 * cat_bonus + 0.15 * price_bonus + 0.10 * loc_bonus + 0.10 * qty_bonus, 4)
        ranked.append({
            **p,
            "match_score": score,
            "matching_engine": engine_used,
        })

    ranked.sort(key=lambda x: x["match_score"], reverse=True)
    return ranked
