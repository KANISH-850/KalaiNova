# KALAINOVA — Environment & Setup Guide

## 1. Prerequisites
- Python 3.11+
- Node.js 20+ & npm
- Optional: Docker & Docker Compose, PostgreSQL / Supabase project

## 2. Environment Variables
Copy `.env.example` to `.env` in the repository root and configure:
- `DATABASE_URL`: PostgreSQL/Supabase connection string (defaults to local SQLite `kalainova_dev.db` for zero-setup local dev).
- `SECRET_KEY` & `ENCRYPTION_KEY`: Strong random keys for JWT & bank account encryption.
- `LLM_PROVIDER`: `openai`, `gemini`, or `none`.
- `HF_TOKEN`: Required if enabling gated AI4Bharat speech/translation models (`ENABLE_LOCAL_SPEECH=true`).

## 3. Running Locally
1. **Train Pricing Models (XGBoost & CatBoost)**:
   ```powershell
   cd backend
   .\.venv\Scripts\python.exe training/train_pricing.py
   ```
2. **Start FastAPI Backend**:
   ```powershell
   .\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
   ```
3. **Start Admin Dashboard**:
   ```powershell
   cd apps/admin
   npm install && npm run dev
   ```
4. **Start Mobile App**:
   ```powershell
   cd apps/mobile
   npm install && npx expo start
   ```

## 4. Docker Deployment
```bash
docker compose up --build
```
