import { describe, it, expect } from "vitest";
import { formatPeriod } from "./period";
import { en, tr } from "./dictionaries";

/** Gerçek sözlüklerle sınanıyor; sahte bir çevirmen eksik ay adını yakalamazdı. */
const trText = (key: keyof typeof tr) => tr[key];
const enText = (key: keyof typeof tr) => en[key];

describe("formatPeriod", () => {
  it("dönemi cihazın dilindeki ay adına çevirir", () => {
    expect(formatPeriod("2026-03", trText)).toBe("Mart 2026");
    expect(formatPeriod("2026-03", enText)).toBe("March 2026");
  });

  it("yılın ilk ve son ayı doğru — sınır kayması olmasın", () => {
    expect(formatPeriod("2025-01", trText)).toBe("Ocak 2025");
    expect(formatPeriod("2025-12", trText)).toBe("Aralık 2025");
  });

  it("tanınmayan biçim olduğu gibi döner", () => {
    // Grafiğin tamamını çökertmek yerine o satırda ham dönem görünsün.
    expect(formatPeriod("2026-13", trText)).toBe("2026-13");
    expect(formatPeriod("2026-00", trText)).toBe("2026-00");
    expect(formatPeriod("2026-3", trText)).toBe("2026-3");
    expect(formatPeriod("", trText)).toBe("");
  });
});
