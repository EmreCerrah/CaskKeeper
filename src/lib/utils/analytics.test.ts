/**
 * buildFlavorTrend testleri.
 *
 * Odak: aya göre doğru gruplama, kategori eşleme ve sıralama. Katalogda
 * olmayan (eşlenemeyen) etiketlerin sessizce yok sayılması — kullanıcı elle
 * veya eski bir sürümden serbest metin etiket girmiş olabilir.
 */

import { describe, it, expect } from "vitest";
import { buildFlavorTrend } from "./analytics";

function note(overrides: {
  tastingDate: string;
  noseTags?: string[];
  palateTags?: string[];
  finishTags?: string[];
}) {
  return {
    noseTags: [],
    palateTags: [],
    finishTags: [],
    ...overrides,
  };
}

describe("buildFlavorTrend", () => {
  it("boş girdi için boş dizi döner", () => {
    expect(buildFlavorTrend([])).toEqual([]);
  });

  it("notları tastingDate ayına göre gruplar", () => {
    const trend = buildFlavorTrend([
      note({ tastingDate: "2026-06-05", noseTags: ["Bal (Honey)"] }),
      note({ tastingDate: "2026-06-20", noseTags: ["Karamel (Caramel)"] }),
      note({ tastingDate: "2026-07-01", noseTags: ["Bal (Honey)"] }),
    ]);

    expect(trend.map((t) => t.period)).toEqual(["2026-06", "2026-07"]);
    expect(trend[0].total).toBe(2);
    expect(trend[1].total).toBe(1);
  });

  it("kronolojik sırayla döner, girdi sırasından bağımsız", () => {
    const trend = buildFlavorTrend([
      note({ tastingDate: "2026-07-01", noseTags: ["Bal (Honey)"] }),
      note({ tastingDate: "2026-01-01", noseTags: ["Bal (Honey)"] }),
      note({ tastingDate: "2026-04-01", noseTags: ["Bal (Honey)"] }),
    ]);

    expect(trend.map((t) => t.period)).toEqual(["2026-01", "2026-04", "2026-07"]);
  });

  it("burun/damak/bitiş etiketlerinin hepsini aynı ay için sayar", () => {
    const trend = buildFlavorTrend([
      note({
        tastingDate: "2026-06-01",
        noseTags: ["Bal (Honey)"], // sweet
        palateTags: ["Karamel (Caramel)"], // sweet
        finishTags: ["Meşe (Oak)"], // woody
      }),
    ]);

    expect(trend[0].total).toBe(3);
    const sweet = trend[0].categories.find((c) => c.category === "sweet");
    const woody = trend[0].categories.find((c) => c.category === "woody");
    expect(sweet?.count).toBe(2);
    expect(woody?.count).toBe(1);
  });

  it("kataloglanmamış (eşlenemeyen) etiketleri sessizce yok sayar", () => {
    const trend = buildFlavorTrend([
      note({ tastingDate: "2026-06-01", noseTags: ["Bal (Honey)", "Uydurma Etiket"] }),
    ]);

    expect(trend[0].total).toBe(1);
    expect(trend[0].categories).toHaveLength(1);
  });

  it("bir aydaki kategorileri sayıya göre azalan sıralar", () => {
    const trend = buildFlavorTrend([
      note({ tastingDate: "2026-06-01", noseTags: ["Meşe (Oak)"] }), // woody x1
      note({
        tastingDate: "2026-06-02",
        noseTags: ["Bal (Honey)"],
        palateTags: ["Karamel (Caramel)"],
        finishTags: ["Toffee"],
      }), // sweet x3
    ]);

    expect(trend[0].categories[0].category).toBe("sweet");
    expect(trend[0].categories[0].count).toBe(3);
    expect(trend[0].categories[1].category).toBe("woody");
    expect(trend[0].categories[1].count).toBe(1);
  });

  it("her kategori için Türkçe etiket taşır", () => {
    const trend = buildFlavorTrend([note({ tastingDate: "2026-06-01", noseTags: ["Bal (Honey)"] })]);

    expect(trend[0].categories[0].label).toBe("Tatlı (Sweet)");
  });
});
