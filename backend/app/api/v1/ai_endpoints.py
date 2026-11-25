import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ai.catalog.llm_cataloguer import generate_multilingual_catalog
from ai.common.registry import ModelRegistry
from ai.pricing.predictor import predict_craft_price
from ai.speech.indic_conformer import transcribe_audio
from ai.translation.indic_trans import translate_text
from ai.vision.birefnet import remove_background_birefnet
from ai.vision.enhancer import enhance_product_image
from app.api.deps import get_current_user
from app.core.config import STORAGE_DIR, settings
from app.database.session import get_db
from app.models import PricingFeature, PricingPrediction, Product, User
from app.schemas.product import PricingAcceptRequest, PricingPredictRequest

router = APIRouter(prefix="/ai", tags=["AI & ML"])


async def _save_upload(file: UploadFile, subdir: str = "uploads") -> Path:
    content = await file.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(status_code=413, detail=f"File exceeds {settings.MAX_UPLOAD_SIZE_MB}MB limit")
    ext = Path(file.filename or "upload.png").suffix or ".png"
    filename = f"{uuid.uuid4().hex}{ext}"
    dest = STORAGE_DIR / subdir / filename
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(content)
    return dest


@router.get("/models")
def get_model_registry(db: Session = Depends(get_db)):
    return ModelRegistry.get_all(db)


@router.post("/image/enhance")
async def api_enhance_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    orig_path = await _save_upload(file, "uploads")
    out_name = f"enh_{orig_path.stem}.png"
    out_path = STORAGE_DIR / "processed" / out_name
    meta = enhance_product_image(orig_path, out_path)
    return {
        "original_url": f"/storage/uploads/{orig_path.name}",
        "enhanced_url": f"/storage/processed/{out_name}",
        **meta,
    }


@router.post("/image/remove-background")
async def api_remove_background(
    file: UploadFile = File(...),
    also_enhance: bool = Form(True),
    current_user: User = Depends(get_current_user),
):
    orig_path = await _save_upload(file, "uploads")
    bg_name = f"nobg_{orig_path.stem}.png"
    bg_path = STORAGE_DIR / "processed" / bg_name

    result = remove_background_birefnet(orig_path, bg_path)
    enhanced_url = None
    if also_enhance:
        enh_name = f"enh_{orig_path.stem}.png"
        enh_path = STORAGE_DIR / "processed" / enh_name
        enhance_product_image(orig_path, enh_path)
        enhanced_url = f"/storage/processed/{enh_name}"

    return {
        "original_url": f"/storage/uploads/{orig_path.name}",
        "enhanced_url": enhanced_url,
        "bg_removed_url": f"/storage/processed/{bg_name}" if result.get("success") else None,
        **result,
    }


@router.post("/speech/transcribe")
async def api_speech_transcribe(
    file: UploadFile = File(...),
    language_code: str = Form("ta"),
    current_user: User = Depends(get_current_user),
):
    audio_path = await _save_upload(file, "uploads")
    return transcribe_audio(audio_path, language_code=language_code)


@router.post("/translate")
def api_translate(
    text: str = Form(...),
    source_lang: str = Form("ta"),
    target_lang: str = Form("en"),
    current_user: User = Depends(get_current_user),
):
    return translate_text(text=text, source_lang=source_lang, target_lang=target_lang)


@router.post("/catalog/generate")
async def api_generate_catalog(
    transcript: str = Form(...),
    source_language: str = Form("ta"),
    craft_category: str = Form("Handloom & Textiles"),
    artisan_location: str = Form("India"),
    current_user: User = Depends(get_current_user),
):
    return await generate_multilingual_catalog(
        transcript=transcript,
        source_language=source_language,
        craft_category=craft_category,
        artisan_location=artisan_location,
    )


@router.post("/pricing/predict")
def api_predict_price(
    payload: PricingPredictRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    artisan_id = current_user.artisan_profile.id if current_user.artisan_profile else 1
    feat = PricingFeature(
        product_id=payload.product_id,
        artisan_id=artisan_id,
        category_name=payload.category_name,
        material_cost=payload.material_cost,
        labour_cost=payload.labour_cost,
        packaging_cost=payload.packaging_cost,
        other_cost=payload.other_cost,
        production_hours=payload.production_hours,
        craft_complexity=payload.craft_complexity,
        desired_margin_pct=payload.desired_margin_pct,
        demand_index=payload.demand_index,
        market_reference_price=payload.market_reference_price,
        shipping_cost=payload.shipping_cost,
    )
    db.add(feat)
    db.flush()

    pred_out = predict_craft_price(payload.model_dump())
    pred_row = PricingPrediction(
        product_id=payload.product_id,
        feature_id=feat.id,
        **pred_out,
    )
    db.add(pred_row)
    db.commit()
    db.refresh(pred_row)

    return {"prediction_id": pred_row.id, **pred_out}


@router.post("/pricing/accept")
def api_accept_price(
    payload: PricingAcceptRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    pred = db.query(PricingPrediction).filter(PricingPrediction.id == payload.prediction_id).first()
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")
    pred.accepted_by_artisan = 1
    target_pid = payload.product_id or pred.product_id
    if target_pid:
        prod = db.query(Product).filter(Product.id == target_pid).first()
        if prod:
            prod.selling_price = payload.accepted_price or pred.recommended_price
            prod.wholesale_price = pred.wholesale_price
    db.commit()
    return {"status": "accepted", "prediction_id": pred.id, "applied_price": payload.accepted_price or pred.recommended_price}


@router.get("/pricing/history")
def api_pricing_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = db.query(PricingPrediction).order_by(PricingPrediction.id.desc()).limit(25).all()
    return [
        {
            "id": r.id,
            "product_id": r.product_id,
            "total_production_cost": r.total_production_cost,
            "recommended_price": r.recommended_price,
            "wholesale_price": r.wholesale_price,
            "retail_price": r.retail_price,
            "profit_margin_pct": r.profit_margin_pct,
            "accepted_by_artisan": bool(r.accepted_by_artisan),
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]
