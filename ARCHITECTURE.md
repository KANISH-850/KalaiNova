# KALAINOVA — System Architecture

## 1. High-Level Overview
KALAINOVA is a monorepo platform connecting marginalized artisans with buyers through an AI-powered virtual business manager.

```
+---------------------------+       +---------------------------+
|   Expo React Native App   |       |   React + TS Admin Web    |
|  (Artisan & Buyer Roles)  |       |   (Moderation & KPIs)     |
+-------------+-------------+       +-------------+-------------+
              |                                   |
              +-----------------+-----------------+
                                | REST / JSON (JWT)
                                v
+---------------------------------------------------------------+
|                     FastAPI Backend (v1)                      |
|  Auth/RBAC | Products | Marketplace | Finance | Agents | Admin|
+----+--------------------+--------------------+----------------+
     |                    |                    |
     v                    v                    v
+---------+      +------------------+    +--------------------+
| SQLAlchemy     |  AI/ML Services  |    |   File Storage     |
| Postgres /     | OpenCV, BiRefNet |    | Supabase / Local   |
| Supabase /     | IndicConformer,  |    | Images, PDFs, ML   |
| SQLite Dev     | IndicTrans2, LLM |    | Model Artifacts    |
|                | XGBoost/CatBoost |    |                    |
|                | SentenceTransf.  |    |                    |
+----------------+------------------+----+--------------------+
```

## 2. Core Data Flows
1. **Product Studio & Voice Cataloguing**:
   - Mobile uploads photo -> `/api/v1/ai/image/remove-background` & `/enhance` -> OpenCV + BiRefNet -> stored image URL + before/after preview.
   - Mobile records regional audio -> `/api/v1/ai/speech/transcribe` (IndicConformer) -> `/api/v1/ai/translate` (IndicTrans2) -> `/api/v1/ai/catalog/generate` (Multilingual LLM) -> structured title, EN/HI descriptions, tags, category.
2. **Dynamic Pricing**:
   - Artisan inputs material, labour, packaging, hours, complexity, desired margin -> `/api/v1/ai/pricing/predict` -> XGBoost & CatBoost ensemble -> persisted `pricing_predictions` + `pricing_features` + explainable breakdown.
3. **Market Linkage**:
   - Buyer searches / submits requirements -> `/api/v1/marketplace/match-buyers` -> SentenceTransformer cosine similarity + category/location/price/quantity scoring -> bulk enquiry -> artisan notification.
4. **FinTech & Agentic AI**:
   - Orders & expenses update `financial_ledger`, `transactions`, `payment_records`.
   - `/api/v1/finance/invoices` generates numbered PDF invoices with UPI QR codes.
   - `/api/v1/agents/{role}` executes real DB queries and ML tools, returning `requires_confirmation: true` for mutating actions until confirmed.
