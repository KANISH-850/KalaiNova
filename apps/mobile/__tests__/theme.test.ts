import { COLORS, LANGUAGES, LABELS } from "../constants/theme";

describe("KALAINOVA Mobile Theme & Localization", () => {
  test("includes required color palette", () => {
    expect(COLORS.deepNavy).toBe("#14233B");
    expect(COLORS.artisanOrange).toBe("#E58A42");
    expect(COLORS.warmCream).toBe("#FFF8EF");
    expect(COLORS.teal).toBe("#168C88");
  });

  test("supports all 6 prioritized Indian languages", () => {
    const codes = LANGUAGES.map((l) => l.code);
    expect(codes).toEqual(["ta", "en", "hi", "te", "kn", "ml"]);
    expect(LABELS.ta.home).toBeDefined();
    expect(LABELS.hi.home).toBeDefined();
  });
});
