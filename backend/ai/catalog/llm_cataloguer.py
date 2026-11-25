import json
import httpx

from app.core.config import settings
from ai.common.registry import ModelRegistry


async def generate_multilingual_catalog(
    transcript: str,
    source_language: str = "ta",
    craft_category: str = "Handicrafts",
    artisan_location: str = "India",
) -> dict:
    """
    Generates structured English & Hindi product catalogue metadata from an artisan's description.
    Uses configured LLM_PROVIDER (openai | gemini) via environment variables.
    If no external LLM key is configured, returns an explicit provider_unconfigured status
    alongside deterministic NLP keyword extraction (never pretending an LLM ran).
    """
    prompt = (
        f"You are an e-commerce cataloguing expert for traditional Indian artisans.\n"
        f"Artisan transcript ({source_language}): {transcript}\n"
        f"Craft category: {craft_category}, Location: {artisan_location}\n"
        f"Return strict JSON with keys: title_en, description_en, title_hi, description_hi, "
        f"suggested_category, tags (array of 5 strings), keywords (comma-separated string)."
    )

    if settings.LLM_PROVIDER == "openai" and settings.OPENAI_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}"},
                    json={
                        "model": settings.OPENAI_MODEL,
                        "response_format": {"type": "json_object"},
                        "messages": [{"role": "user", "content": prompt}],
                    },
                )
                resp.raise_for_status()
                data = json.loads(resp.json()["choices"][0]["message"]["content"])
                ModelRegistry.update_status("Multilingual-LLM", "active (openai)", settings.OPENAI_MODEL)
                return {"success": True, "provider": "openai", "model": settings.OPENAI_MODEL, **data}
        except Exception as exc:
            return {"success": False, "provider": "openai", "status": "provider_error", "error": str(exc)}

    if settings.LLM_PROVIDER == "gemini" and settings.GEMINI_API_KEY:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(
                    url,
                    json={
                        "contents": [{"parts": [{"text": prompt}]}],
                        "generationConfig": {"responseMimeType": "application/json"},
                    },
                )
                resp.raise_for_status()
                raw_text = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
                data = json.loads(raw_text)
                ModelRegistry.update_status("Multilingual-LLM", "active (gemini)", settings.GEMINI_MODEL)
                return {"success": True, "provider": "gemini", "model": settings.GEMINI_MODEL, **data}
        except Exception as exc:
            return {"success": False, "provider": "gemini", "status": "provider_error", "error": str(exc)}

    # Explicit unconfigured state + deterministic structural extraction
    clean_text = transcript.strip()
    words = [w.strip(".,!?") for w in clean_text.split() if len(w.strip(".,!?")) > 3]
    tags = list(dict.fromkeys([craft_category.lower().replace(" ", "-"), "handmade", "artisan"] + words[:4]))[:6]
    return {
        "success": True,
        "provider": "none (deterministic_extractor)",
        "llm_configured": False,
        "notice": "External LLM_PROVIDER is not configured. Returned deterministic structural extraction; set LLM_PROVIDER and API key in .env for generative multilingual copy.",
        "title_en": f"Handcrafted {craft_category} — {clean_text[:48]}",
        "description_en": f"Authentic handmade {craft_category.lower()} crafted in {artisan_location}. Artisan note: {clean_text}",
        "title_hi": f"हस्तनिर्मित {craft_category} उत्पाद",
        "description_hi": f"{artisan_location} के कारीगर द्वारा निर्मित प्रामाणिक हस्तनिर्मित {craft_category}। विवरण: {clean_text}",
        "suggested_category": craft_category,
        "tags": tags,
        "keywords": ", ".join(tags),
    }
