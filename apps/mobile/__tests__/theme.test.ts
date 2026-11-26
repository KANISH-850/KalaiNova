jest.mock("react-native", () => ({
  Platform: { select: (obj: Record<string, string>) => obj.default || obj.web },
}));

import { PALETTE, COLORS, LANGUAGES, LABELS } from "../constants/theme";

describe("KALAINOVA Design System Tokens & Localization", () => {
  test("uses warm handloom & fintech palette tokens", () => {
    expect(PALETTE.bg).toBe("#FAF6EF");
    expect(PALETTE.primary).toBe("#26336B");
    expect(PALETTE.accent).toBe("#B5452F");
    expect(PALETTE.highlight).toBe("#D9A21B");
    expect(PALETTE.text).toBe("#2A2420");
    expect(PALETTE.success).toBe("#3F7D4E");
    expect(COLORS.primary).toBe("#26336B");
  });

  test("supports Tamil default and all 6 prioritized Indian languages", () => {
    const codes = LANGUAGES.map((l) => l.code);
    expect(codes).toEqual(["ta", "en", "hi", "te", "kn", "ml"]);
    expect(LABELS.ta.tabHome).toBeDefined();
    expect(LABELS.en.tabHome).toBe("Home");
    expect(LABELS.hi.tabHome).toBeDefined();
  });
});
