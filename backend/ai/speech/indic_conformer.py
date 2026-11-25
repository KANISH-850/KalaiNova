import os
from pathlib import Path
from typing import Optional

from app.core.config import settings
from ai.common.registry import ModelRegistry

os.environ.setdefault("HF_HOME", settings.HF_HOME)

_asr_pipeline = None
_asr_error: Optional[str] = None

SUPPORTED_LANGUAGES = {
    "ta": "Tamil",
    "en": "English",
    "hi": "Hindi",
    "te": "Telugu",
    "kn": "Kannada",
    "ml": "Malayalam",
}


def _load_indic_conformer():
    global _asr_pipeline, _asr_error
    if _asr_pipeline is not None:
        return _asr_pipeline
    if not settings.ENABLE_LOCAL_SPEECH:
        _asr_error = (
            "Local IndicConformer inference is disabled (ENABLE_LOCAL_SPEECH=false). "
            "Enable ENABLE_LOCAL_SPEECH=true with HF_TOKEN for ai4bharat/indic-conformer-600m-multilingual."
        )
        ModelRegistry.update_status("IndicConformer", "adapter_configured", _asr_error)
        return None
    try:
        from transformers import AutoModel

        model = AutoModel.from_pretrained(
            "ai4bharat/indic-conformer-600m-multilingual",
            trust_remote_code=True,
            token=settings.HF_TOKEN or None,
        )
        _asr_pipeline = model
        _asr_error = None
        ModelRegistry.update_status("IndicConformer", "loaded", "ai4bharat/indic-conformer-600m-multilingual loaded")
        return _asr_pipeline
    except Exception as exc:
        _asr_error = f"IndicConformer unavailable: {exc}"
        ModelRegistry.update_status("IndicConformer", "unavailable", _asr_error)
        return None


def transcribe_audio(audio_path: str | Path, language_code: str = "ta") -> dict:
    """
    Transcribes regional audio using AI4Bharat IndicConformer when enabled & available.
    Returns an explicit unavailable state with setup instructions if the gated/large model
    is not loaded locally, never fabricating a fake transcription.
    """
    if language_code not in SUPPORTED_LANGUAGES:
        return {
            "success": False,
            "status": "unsupported_language",
            "error": f"Language '{language_code}' not in supported set: {list(SUPPORTED_LANGUAGES.keys())}",
        }

    model = _load_indic_conformer()
    if model is None:
        return {
            "success": False,
            "model": "ai4bharat/indic-conformer-600m-multilingual",
            "language": SUPPORTED_LANGUAGES[language_code],
            "status": "unavailable",
            "error": _asr_error,
            "setup_hint": "Set ENABLE_LOCAL_SPEECH=true and provide HF_TOKEN in .env after accepting ai4bharat/indic-conformer-600m-multilingual license on Hugging Face.",
        }

    try:
        import torchaudio

        wav, sr = torchaudio.load(str(audio_path))
        if sr != 16000:
            wav = torchaudio.functional.resample(wav, orig_freq=sr, new_freq=16000)
        transcript = model(wav, language_code, "ctc")
        return {
            "success": True,
            "model": "ai4bharat/indic-conformer-600m-multilingual",
            "language": SUPPORTED_LANGUAGES[language_code],
            "language_code": language_code,
            "transcript": str(transcript),
            "status": "completed",
        }
    except Exception as exc:
        return {
            "success": False,
            "model": "ai4bharat/indic-conformer-600m-multilingual",
            "status": "inference_error",
            "error": str(exc),
        }
