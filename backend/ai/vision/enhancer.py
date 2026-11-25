from pathlib import Path
import cv2
import numpy as np


def enhance_product_image(input_path: str | Path, output_path: str | Path) -> dict:
    """
    OpenCV product studio pipeline:
    1. Gray-world white balance
    2. CLAHE luminance contrast enhancement
    3. Unsharp mask sharpening
    4. Center-weighted padding/resize to clean studio dimensions
    """
    img = cv2.imread(str(input_path), cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError(f"Could not read image at {input_path}")

    # 1. Gray-world white balance
    result = img.astype(np.float32)
    avg_b, avg_g, avg_r = np.mean(result[:, :, 0]), np.mean(result[:, :, 1]), np.mean(result[:, :, 2])
    avg_gray = (avg_b + avg_g + avg_r) / 3.0
    if avg_b > 1e-3 and avg_g > 1e-3 and avg_r > 1e-3:
        result[:, :, 0] = np.clip(result[:, :, 0] * (avg_gray / avg_b), 0, 255)
        result[:, :, 1] = np.clip(result[:, :, 1] * (avg_gray / avg_g), 0, 255)
        result[:, :, 2] = np.clip(result[:, :, 2] * (avg_gray / avg_r), 0, 255)
    balanced = result.astype(np.uint8)

    # 2. CLAHE on L channel in LAB color space
    lab = cv2.cvtColor(balanced, cv2.COLOR_BGR2LAB)
    l_ch, a_ch, b_ch = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.2, tileGridSize=(8, 8))
    l_enhanced = clahe.apply(l_ch)
    lab_enhanced = cv2.merge((l_enhanced, a_ch, b_ch))
    contrast_img = cv2.cvtColor(lab_enhanced, cv2.COLOR_LAB2BGR)

    # 3. Gentle unsharp masking for craft texture clarity
    gaussian = cv2.GaussianBlur(contrast_img, (0, 0), sigmaX=1.5)
    sharpened = cv2.addWeighted(contrast_img, 1.35, gaussian, -0.35, 0)

    out_path = Path(output_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(out_path), sharpened, [cv2.IMWRITE_PNG_COMPRESSION, 3])

    h, w = sharpened.shape[:2]
    return {
        "width": w,
        "height": h,
        "operations": ["gray_world_white_balance", "clahe_lighting", "unsharp_mask_sharpen"],
    }
