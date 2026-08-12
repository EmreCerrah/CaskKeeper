import { describe, it, expect } from "vitest";
import { formatPeriod } from "./period";
import { en, tr } from "./dictionaries";

/** Tested against the real dictionaries; a fake translator would not catch a missing month name. */
const trText = (key: keyof typeof tr) => tr[key];
const enText = (key: keyof typeof tr) => en[key];

describe("formatPeriod", () => {
  it("turns a period into the month name in the device's language", () => {
    expect(formatPeriod("2026-03", trText)).toBe("Mart 2026");
    expect(formatPeriod("2026-03", enText)).toBe("March 2026");
  });

  it("gets the first and last month of the year right — no off-by-one", () => {
    expect(formatPeriod("2025-01", trText)).toBe("Ocak 2025");
    expect(formatPeriod("2025-12", trText)).toBe("Aralık 2025");
  });

  it("returns an unrecognised format unchanged", () => {
    // Show the raw period on that row rather than bringing down the whole
    // chart.
    expect(formatPeriod("2026-13", trText)).toBe("2026-13");
    expect(formatPeriod("2026-00", trText)).toBe("2026-00");
    expect(formatPeriod("2026-3", trText)).toBe("2026-3");
    expect(formatPeriod("", trText)).toBe("");
  });
});
