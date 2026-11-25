import os
from typing import Optional

from app.core.config import settings
from ai.common.registry import ModelRegistry

os.environ.setdefault("HF_HOME", settings.HF_HOME)

_trans_model = None
_trans_tokenizer = None
_trans_error: Optional[str] = None


def _load_indictrans2():
    global _trans_model, _trans_tokenizer, _trans_error
    if _trans_model is not None:
        return _trans_model, _trans_tokenizer
    if not settings.ENABLE_LOCAL_TRANSLATION:
        _trans_error = (
            "Local IndicTrans2 inference is disabled (ENABLE_LOCAL_TRANSLATION=false). "
            "Set ENABLE_LOCAL_TRANSLATION=true to load ai4bharat/indictrans2-indic-en-dist-200M."
        )
        ModelRegistry.update_status("IndicTrans2", "adapter_configured", _trans_error)
        return None, None
    try:
        from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

        model_name = "ai4bharat/indictrans2-indic-en-dist-200M"
        _trans_tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True, token=settings.HF_TOKEN or None)
        _trans_model = AutoModelForSeq2SeqLM.from_pretrained(model_name, trust_remote_code=True, token=settings.HF_TOKEN or None)
        _trans_error = None
        ModelRegistry.update_status("IndicTrans2", "loaded", f"{model_name} loaded")
        return _trans_model, _trans_tokenizer
    except Exception as exc:
        _trans_error = f"IndicTrans2 unavailable: {exc}"
        ModelRegistry.update_status("IndicTrans2", "unavailable", _trans_error)
        return None, None


def translate_text(text: str, source_lang: str, target_lang: str = "en") -> dict:
    """
    Translates regional artisan descriptions using IndicTrans2 when enabled.
    Returns explicit status if local model is disabled or unavailable.
    """
    if source_lang == target_lang:
        return {
            "success": True,
            "model": "identity",
            "source_lang": source_lang,
            "target_lang": target_lang,
            "translated_text": text,
            "status": "completed",
        }

    model, tokenizer = _load_indictrans2()
    if model is None or tokenizer is None:
        return {
            "success": False,
            "model": "ai4bharat/indictrans2-indic-en-dist-200M",
            "source_lang": source_lang,
            "target_lang": target_lang,
            "status": "unavailable",
            "error": _trans_error,
            "setup_hint": "Set ENABLE_LOCAL_TRANSLATION=true in .env (and HF_TOKEN if required) to download and run IndicTrans2.",
        }

    try:
        inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True)
        generated = model.generate(**inputs, max_new_tokens=256)
        translated = tokenizer.batch_decode(generated, skip_special_tokens=True)[0]
        return {
            "success": True,
            "model": "ai4bharat/indictrans2-indic-en-dist-200M",
            "source_lang": source_lang,
            "target_lang": target_lang,
            "translated_text": translated,
            "status": "completed",
        }
    except Exception as exc:
        return {
            "success": False,
            "model": "ai4bharat/indictrans2-indic-en-dist-200M",
            "status": "inference_error",
            "error": str(exc),
        }
