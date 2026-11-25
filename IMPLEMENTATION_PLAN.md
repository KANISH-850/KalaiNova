# KALAINOVA — Implementation Plan

## Phase 1: Project Foundation
- Inspect workspace, Python, Node.js, GPU/CPU, and disk resources.
- Create monorepo structure (`apps/mobile`, `apps/admin`, `backend`, `shared`, `infrastructure`, `docs`).
- Configure `.env.example`, `.gitignore`, `docker-compose.yml`, root `package.json`.
- Author `PROJECT_STATUS.md`, `IMPLEMENTATION_PLAN.md`, `ARCHITECTURE.md`.

## Phase 2: Backend & Database
- Set up Python 3.11 virtual environment in `backend/.venv` (with HF cache on `E:\` to preserve `C:\` space).
- Implement `backend/app/core/config.py`, `security.py` (JWT + PBKDF2/bcrypt password hashing, Fernet encryption for sensitive bank/UPI fields).
- Implement normalized SQLAlchemy 2.0 models (24 tables: `users`, `artisan_profiles`, `buyer_profiles`, `shg_groups`, `products`, `product_images`, `product_translations`, `product_categories`, `pricing_predictions`, `pricing_features`, `orders`, `order_items`, `buyer_enquiries`, `transactions`, `payment_records`, `expenses`, `financial_ledger`, `invoices`, `invoice_items`, `financial_reports`, `notifications`, `ai_conversations`, `ai_agent_actions`, `model_metadata`).
- Implement seed data script with 5 regional artisans, 5 authentic craft products, buyer profiles, orders, enquiries, and financial ledger entries (marked `is_demo=True`).
- Implement REST APIs for Auth, Products, Marketplace, Finance, Agents, Admin.

## Phase 3: AI/ML Integration & Training
- **Model Registry**: Central registry tracking name, version, source, license, task, I/O format, hardware requirements, and live loading status.
- **Vision Pipeline**: OpenCV preprocessing (auto white-balance, CLAHE lighting, unsharp masking) + BiRefNet (`ZhengPeng7/BiRefNet` / `BiRefNet_lite` with CPU/GPU support) background removal.
- **Speech & Translation**: AI4Bharat IndicConformer (`ai4bharat/indic-conformer-600m-multilingual`) + IndicTrans2 (`ai4bharat/indictrans2-indic-en-dist-200M`) with explicit model status and documented API adapter fallback if gated/unavailable.
- **Multilingual LLM**: Configurable provider adapter (OpenAI/Gemini/OpenRouter/HuggingFace via env vars) for structured catalogue generation in English & Hindi.
- **Dynamic Pricing**: Feature engineering + synthetic-labelled training dataset (`backend/training/datasets/craft_pricing_dataset.csv`), training & evaluation scripts (`train_pricing.py`, `evaluate_models.py`) for **XGBoost** and **CatBoost**, model persistence, and explainable prediction API.
- **Semantic Matching**: `sentence-transformers/all-MiniLM-L6-v2` embeddings + weighted score (semantic similarity, category, location, price range, quantity).

## Phase 4: FinTech & Agentic AI
- Digital financial ledger, automatic gross/net profit & margin calculation.
- Smart PDF invoice generator (`reportlab`) with artisan/buyer info, tax fields, and UPI QR code (`qrcode`).
- Financial assistance readiness & government scheme pre-screening (PM Vishwakarma, MUDRA, PMEGP, Stand-Up India).
- 5 specialized backend-tool-using agents (Cataloguing, Pricing, Market Intelligence, Financial Assistant, Business Growth) with explicit user confirmation gates for mutating actions.

## Phase 5: Mobile Application (React Native + Expo + TypeScript)
- Expo Router navigation with `(auth)`, `(artisan)`, `(buyer)`, `catalog`, `pricing`, `finance`, `marketplace`, `assistant`.
- NativeWind / Tailwind CSS styling with Warm Artisan + FinTech palette (`#14233B`, `#E58A42`, `#FFF8EF`, `#168C88`, `#F7F8FA`, `#1C2736`).
- All 24 required screens connected to live FastAPI endpoints.

## Phase 6: Admin Dashboard (React + Vite + TypeScript)
- Live database-backed KPIs, product approval queue, user & SHG management, order & transaction overview, AI model registry monitor, activity logs.

## Phase 7: Testing & Verification
- Backend `pytest` suite covering auth, RBAC, products, vision, pricing, finance, invoices, buyer matching, and agents.
- Frontend TypeScript type-checking & Jest/RNTL tests.
- End-to-end verification of all 6 Acceptance Criteria demos.
