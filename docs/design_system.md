# KALAINOVA — Human-Crafted Design System

## 1. Audit of Existing AI-Generated Patterns (Step 0)
Inspecting the initial prototype screens across `apps/mobile` and `apps/admin` revealed the following AI-generated tropes to eliminate:
1. **Uniform 2x4 Card Grid (`apps/mobile/app/(artisan)/index.tsx`)**: Eight identical rounded-square tiles with bright, mismatched icon background boxes (`#E58A42`, `#168C88`, `#B45309`, `#15803D`, `#14233B`).
2. **Generic SaaS Colour Palette (`theme.ts`)**: Cool slate `#F7F8FA`, `#CBD5E1`, and `#64748B` paired with generic navy/orange/teal accents instead of warm, craft-rooted materials.
3. **Mixed & Generic Copy**: Phrases like `"From Traditional Craftsmanship to Intelligent Digital Commerce"`, `"Welcome Back"`, `"5 Specialized Agents"`, `"XGBoost + CatBoost"` exposed technical jargon to low-literacy artisans instead of plain, helpful shop-assistant language.
4. **Repetitive Card Stacks**: Ledger entries, orders, notifications, and products all used identical white bordered rectangles instead of distinct lists, image-led product cards, and full-width action rows.
5. **Missing States & Small Targets**: No skeleton loaders, generic empty text, no swipe-slider for before/after studio comparison, and inconsistent button heights (< 48px in places).
6. **Admin Dashboard (`apps/admin/src/App.tsx`)**: Top-bar SaaS template with 4 large drop-shadow KPI cards (`boxShadow: 0 2px 10px`) instead of a structured sidebar, dense readable tables, and real-data micro-bars.

---

## 2. Design Direction
**Warm, crafted, trustworthy.** Handloom shop meets a clean fintech ledger.

### Colour Tokens (Single Source of Truth)
| Token | Hex | Usage |
|---|---|---|
| `bg` | `#FAF6EF` | Warm off-white / unbleached cotton canvas |
| `surface` | `#FFFDF9` | Card & sheet background |
| `surfaceAlt` | `#F2ECE1` | Subtle warm tint for list dividers, skeletons, inactive pills |
| `primary` | `#26336B` | Deep indigo (indigo dye) — primary buttons, active tabs, headers |
| `accent` | `#B5452F` | Madder red / terracotta — secondary highlights, craft tags |
| `highlight` | `#D9A21B` | Turmeric — used sparingly for key badges / active step |
| `text` | `#2A2420` | Warm near-black primary text |
| `textSecondary` | `#6B5F55` | Warm taupe secondary text |
| `border` | `#E3D9C8` | 1px warm border (replaces heavy drop shadows) |
| `success` | `#3F7D4E` | Muted natural green |
| `error` | `#B33A2E` | Brick red |

### Typography (4-Size Scale, Min 16px Body)
- **Display / Headings**: Serif (`Fraunces` / `Georgia` fallback on native) — used strictly for screen titles and product names.
- **Body / UI**: `Noto Sans Tamil` + `Inter` (balanced Tamil & English rendering).
- **Scale**:
  - `display`: `26px` (line-height `34px`, weight `700`) — Screen titles
  - `title`: `20px` (line-height `28px`, weight `700`) — Section & product titles
  - `body`: `16px` (line-height `24px`, weight `400/600`) — All body copy, inputs, buttons
  - `caption`: `16px` (muted `#6B5F55`, weight `500`) — Secondary metadata (respecting min 16px readability)

### Spacing, Radius & Touch Targets
- **8-pt spacing grid**: `8, 16, 24, 32, 40`
- **Corner radius**: `8px` for inputs & buttons, `12px` for cards & sheets
- **Borders**: `1px` solid `#E3D9C8` instead of heavy shadows
- **Touch targets**: Minimum `48px` height (`minHeight: 48`) on every button, tab, and row
- **Iconography**: **Lucide** (`lucide-react-native` on mobile, `lucide-react` on admin), single `1.75` stroke weight, zero emojis.

### Artisan-First UX & Copy Rules
- **Tamil (`ta`) default** with instant `தமிழ் / EN` switcher on the first screen and in Profile.
- **Plain, human shop-assistant copy**: Short sentences, no marketing buzzwords, no ML jargon (`"Check fair price"` instead of `"XGBoost + CatBoost"`).
- **5-Step Product Flow**: `Photo → Clean → Speak → Price → Save` with visible step indicator.
- **Money**: Large `₹` figures, plain labels (`"Earned this month"`, `"To receive"`), simple SVG bar chart.
- **Before / After Studio**: Interactive swipe slider comparing original vs processed photo.
- **Bottom Tab Bar**: 5 tabs with icon + label (`Home`, `Products`, `Orders`, `Money`, `Help`).
