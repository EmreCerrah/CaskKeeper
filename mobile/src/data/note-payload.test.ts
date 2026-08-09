import { describe, it, expect } from "vitest";
import { toNotePayload, toggleTag, type NoteFormState } from "./note-payload";

function form(overrides: Partial<NoteFormState> = {}): NoteFormState {
  return {
    whiskeyId: "aaaaaaaaaaaaaaaaaaaaaaaa",
    tastingDate: new Date("2026-08-09T00:00:00.000Z"),
    rating: 88,
    noseTags: [],
    noseNotes: "",
    palateTags: [],
    palateNotes: "",
    finishTags: [],
    finishNotes: "",
    finishLength: "medium",
    personalNotes: "",
    visibility: "private",
    isFavorite: false,
    ...overrides,
  };
}

/**
 * Bu dönüşümün hataları sessiz: sunucu 400 döner, kullanıcı "kaydedilemedi"
 * görür ve sebebini anlamaz. O yüzden kurallar burada sabitleniyor.
 */
describe("toNotePayload", () => {
  it("tarihi ISO olarak gönderir", () => {
    expect(toNotePayload(form()).tastingDate).toBe("2026-08-09T00:00:00.000Z");
  });

  it("puanı 0-100 aralığına tam sayı olarak kırpar", () => {
    // Kaydırıcı ondalık üretebiliyor; sunucudaki şema tam sayı bekliyor.
    expect(toNotePayload(form({ rating: 87.6 })).rating).toBe(88);
    expect(toNotePayload(form({ rating: -5 })).rating).toBe(0);
    expect(toNotePayload(form({ rating: 140 })).rating).toBe(100);
  });

  it("boş metin alanlarını hiç göndermez", () => {
    const payload = toNotePayload(form({ noseNotes: "   ", personalNotes: "" }));
    expect(payload.noseNotes).toBeUndefined();
    expect(payload.personalNotes).toBeUndefined();
  });

  it("dolu metinlerin kenar boşluğunu temizler", () => {
    expect(toNotePayload(form({ palateNotes: "  bal ve meşe  " })).palateNotes).toBe("bal ve meşe");
  });

  it("etiketlerin yinelenenlerini ve boşlarını atar, SIRAYI korur", () => {
    // Sıra korunmalı: kullanıcı seçtiği sırayı görüyor.
    const payload = toNotePayload(form({ noseTags: ["Bal (Honey)", "", "Bal (Honey)", "Meşe (Oak)"] }));
    expect(payload.noseTags).toEqual(["Bal (Honey)", "Meşe (Oak)"]);
  });

  it("etiketleri ÇEVİRMEZ ya da biçimlendirmez", () => {
    // Saklanan değer bunlar; istatistikler bu metinleri eşleştiriyor.
    const tag = "Tıbbi/İyot (Medicinal/Iodine)";
    expect(toNotePayload(form({ finishTags: [tag] })).finishTags).toEqual([tag]);
  });

  it("görünürlük ve favori alanlarını olduğu gibi taşır", () => {
    const payload = toNotePayload(form({ visibility: "public", isFavorite: true }));
    expect(payload.visibility).toBe("public");
    expect(payload.isFavorite).toBe(true);
  });
});

describe("toggleTag", () => {
  it("olmayan etiketi ekler, sona koyar", () => {
    expect(toggleTag(["a"], "b")).toEqual(["a", "b"]);
  });

  it("var olan etiketi çıkarır", () => {
    expect(toggleTag(["a", "b"], "a")).toEqual(["b"]);
  });

  it("girdiyi değiştirmez", () => {
    const original = ["a"];
    toggleTag(original, "b");
    expect(original).toEqual(["a"]);
  });
});
