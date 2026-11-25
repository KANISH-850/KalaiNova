# KALAINOVA — AI-Powered Artisan Commerce & Financial Empowerment Platform

**From Traditional Craftsmanship to Intelligent Digital Commerce.**

KALAINOVA is an end-to-end AI + FinTech + Digital Commerce platform built for marginalized artisans, weavers, handicraft makers, rural micro-entrepreneurs, and women-led Self-Help Groups (SHGs).

## Monorepo Structure
- `apps/mobile`: React Native + Expo + TypeScript + Expo Router mobile application (Artisan & Buyer experiences).
- `apps/admin`: React + Vite + TypeScript Admin & Governance Dashboard.
- `backend`: FastAPI + SQLAlchemy + PostgreSQL/Supabase backend with AI/ML pipelines, FinTech services, and 5 specialized Agentic AI workflows.
- `infrastructure`: Dockerfiles and database initialization scripts.
- `docs`: Architecture, AI model registry, API reference, and setup guide.

## Quick Start
1. **Backend**:
   ```powershell
   cd backend
   .\.venv\Scripts\python.exe training/train_pricing.py
   .\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
   ```
2. **Admin Dashboard**:
   ```powershell
   cd apps/admin
   npm run dev
   ```
3. **Mobile App**:
   ```powershell
   cd apps/mobile
   npx expo start
   ```

## Demo Accounts (Password: `Kalai@123`)
- **Artisan (Tamil Nadu Handloom)**: `kavitha.weaver@kalainova.demo`
- **Buyer (Boutique)**: `ananya.boutique@kalainova.demo`
- **Admin**: `admin@kalainova.demo`
