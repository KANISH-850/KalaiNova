# KALAINOVA — REST API Documentation

Base URL: `http://localhost:8000/api/v1` (Interactive OpenAPI docs available at `http://localhost:8000/docs`)

## Authentication
- `POST /auth/register` — Register Artisan, Buyer, or Admin (encrypts bank details at rest).
- `POST /auth/login` — Login with email or phone; returns JWT bearer token.
- `GET /auth/me` — Get authenticated user & profile.
- `PUT /auth/profile` — Update artisan craft, UPI ID, and encrypted bank details.

## Products
- `GET /products/categories` — List craft categories.
- `POST /products` — Create product (Artisan/Admin).
- `GET /products` — List products (supports `mine=true`, `category`, `search`).
- `GET /products/{id}` — Product details with images and translations.
- `PUT /products/{id}` — Update owned product.
- `DELETE /products/{id}` — Delete owned product.

## AI & ML
- `GET /ai/models` — Live AI Model Registry status.
- `POST /ai/image/enhance` — OpenCV lighting, white-balance & sharpening.
- `POST /ai/image/remove-background` — BiRefNet background removal + OpenCV enhancement.
- `POST /ai/speech/transcribe` — AI4Bharat IndicConformer ASR.
- `POST /ai/translate` — IndicTrans2 translation.
- `POST /ai/catalog/generate` — Multilingual LLM catalogue generation.
- `POST /ai/pricing/predict` — XGBoost + CatBoost dynamic pricing prediction.
- `POST /ai/pricing/accept` — Apply recommended price to product.

## Marketplace
- `GET /marketplace/products` — Discover approved products.
- `POST /marketplace/match-buyers` — Semantic buyer-product matching.
- `POST /marketplace/enquiries` — Submit bulk order enquiry (Buyer).
- `GET /marketplace/enquiries` — List enquiries.
- `POST /marketplace/orders` — Create order (Buyer).
- `GET /marketplace/orders` — List orders.

## FinTech
- `GET /finance/dashboard` — Revenue, expenses, net profit, margin, product profitability.
- `GET /finance/ledger` — Double-entry style financial ledger.
- `POST /finance/transactions` — Record income/expense.
- `POST /finance/invoices` — Generate numbered PDF invoice.
- `GET /finance/payments/qr` — Generate UPI QR code PNG (base64).
- `GET /finance/reports` — Financial readiness score & scheme pre-screening.

## Agentic AI
- `POST /agents/{agent_type}` — `catalog`, `pricing`, `finance`, `market-intelligence`, `business-growth` (supports `confirm_action_id` for mutating actions).

## Admin
- `GET /admin/dashboard` — Live DB KPIs.
- `GET /admin/users` — User directory.
- `GET /admin/products` — Product moderation queue.
- `PUT /admin/products/{id}/status` — Approve/reject products.
- `GET /admin/analytics` — SHGs, category distribution, AI model status, agent action logs.
