import { Platform } from "react-native";

export const PALETTE = {
  bg: "#FAF6EF",
  surface: "#FFFDF9",
  surfaceAlt: "#F2ECE1",
  primary: "#26336B",
  accent: "#B5452F",
  highlight: "#D9A21B",
  text: "#2A2420",
  textSecondary: "#6B5F55",
  border: "#E3D9C8",
  success: "#3F7D4E",
  error: "#B33A2E",
  white: "#FFFDF9",
} as const;

// Backwards-compatible alias for any existing test/imports
export const COLORS = {
  ...PALETTE,
  deepNavy: PALETTE.primary,
  artisanOrange: PALETTE.accent,
  warmCream: PALETTE.bg,
  teal: PALETTE.primary,
  lightBg: PALETTE.bg,
  primaryText: PALETTE.text,
  mutedText: PALETTE.textSecondary,
  danger: PALETTE.error,
};

export const SPACING = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 40,
} as const;

export const RADIUS = {
  control: 8,
  card: 12,
} as const;

export const TYPOGRAPHY = {
  serifFamily: Platform.select({
    ios: "Georgia",
    android: "serif",
    web: "'Fraunces', Georgia, serif",
    default: "serif",
  }),
  sansFamily: Platform.select({
    ios: "System",
    android: "sans-serif",
    web: "'Noto Sans Tamil', 'Inter', system-ui, sans-serif",
    default: "sans-serif",
  }),
  display: { fontSize: 26, lineHeight: 34, fontWeight: "700" as const },
  title: { fontSize: 20, lineHeight: 28, fontWeight: "700" as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: "400" as const },
  bodyBold: { fontSize: 16, lineHeight: 24, fontWeight: "600" as const },
} as const;

export const LANGUAGES = [
  { code: "ta", name: "தமிழ்", englishName: "Tamil" },
  { code: "en", name: "English", englishName: "English" },
  { code: "hi", name: "हिन्दी", englishName: "Hindi" },
  { code: "te", name: "తెలుగు", englishName: "Telugu" },
  { code: "kn", name: "ಕನ್ನಡ", englishName: "Kannada" },
  { code: "ml", name: "മലയാളം", englishName: "Malayalam" },
] as const;

export { LABELS } from "./i18n";
