import os
from pathlib import Path
from typing import Optional
from PIL import Image

from app.core.config import settings
from ai.common.registry import ModelRegistry

os.environ.setdefault("HF_HOME", settings.HF_HOME)

_birefnet_model = None
_birefnet_device = None
_birefnet_error: Optional[str] = None


def _load_birefnet():
    global _birefnet_model, _birefnet_device, _birefnet_error
    if _birefnet_model is not None:
        return _birefnet_model, _birefnet_device
    if not settings.ENABLE_LOCAL_BIREFNET:
        _birefnet_error = "ENABLE_LOCAL_BIREFNET is false in configuration."
        return None, None
    try:
        import torch
        from transformers import AutoModelForImageSegmentation

        device = "cuda" if torch.cuda.is_available() else "cpu"
        model = AutoModelForImageSegmentation.from_pretrained(
            "ZhengPeng7/BiRefNet_lite",
            trust_remote_code=True,
        )
        model.to(device)
        model.eval()
        _birefnet_model = model
        _birefnet_device = device
        _birefnet_error = None
        ModelRegistry.update_status("BiRefNet", f"loaded ({device})", "ZhengPeng7/BiRefNet_lite active")
        return _birefnet_model, _birefnet_device
    except Exception as exc:
        _birefnet_error = f"BiRefNet model unavailable: {exc}"
        ModelRegistry.update_status("BiRefNet", "unavailable", _birefnet_error)
        return None, None


def remove_background_birefnet(input_path: str | Path, output_path: str | Path) -> dict:
    """
    Runs actual pretrained ZhengPeng7/BiRefNet_lite segmentation on GPU or CPU.
    Never fakes background removal with CSS or static white rectangles.
    If model weights cannot be loaded, returns explicit unavailable status.
    """
    model, device = _load_birefnet()
    if model is None:
        return {
            "success": False,
            "model": "ZhengPeng7/BiRefNet_lite",
            "status": "unavailable",
            "error": _birefnet_error or "BiRefNet model could not be initialized.",
            "setup_hint": "Ensure internet access for initial Hugging Face weight download or pre-cache ZhengPeng7/BiRefNet_lite in HF_HOME.",
        }

    import torch
    from torchvision import transforms

    orig_img = Image.open(input_path).convert("RGB")
    orig_size = orig_img.size

    transform = transforms.Compose([
        transforms.Resize((512, 512)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])
    input_tensor = transform(orig_img).unsqueeze(0).to(device)

    with torch.no_grad():
        preds = model(input_tensor)[-1].sigmoid().cpu()

    pred_mask = preds[0].squeeze()
    mask_pil = transforms.ToPILImage()(pred_mask).resize(orig_size, Image.Resampling.BILINEAR)

    rgba = orig_img.copy()
    rgba.putalpha(mask_pil)

    out_path = Path(output_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    rgba.save(out_path, format="PNG")

    return {
        "success": True,
        "model": "ZhengPeng7/BiRefNet_lite",
        "device": device,
        "status": "completed",
        "width": orig_size[0],
        "height": orig_size[1],
    }
