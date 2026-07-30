/**
 * @file recommendations.ts
 * @description Öneri motoru için saf hesaplama fonksiyonları. Veritabanı
 * bağımlılığı yoktur — repository ham veriyi çeker, burada işlenir.
 *
 * Yaklaşım: kullanıcının tadım notlarındaki aroma etiketlerinden bir "damak
 * profili" (kategori başına normalize ağırlık, toplamı 1) çıkarılır. Her aday
 * viski, `flavorProfile` alanındaki terimlerin ait olduğu benzersiz kategoriler
 * üzerinden bu profille karşılaştırılır — skor, viskinin kapsadığı kategorilerin
 * kullanıcı ağırlıklarının toplamıdır (0 ile 1 arası).
 */

import { categoryForTag } from "@/lib/constants/aroma-wheel";
import { categoryForFlavorTerm } from "@/lib/constants/flavor-profile-map";
import type { NoteTagsInput } from "./analytics";

export interface CategoryPreferences {
  /** kategori id → 0-1 arası normalize ağırlık, toplamı 1 (boşsa 0) */
  weights: Map<string, number>;
  /** Kullanıcının kategori eşlemesi bulunan toplam etiket sayısı */
  totalTags: number;
}

/**
 * Tadım notlarındaki tüm aroma etiketlerini kategorilere göre sayar ve
 * normalize eder. Eşlenemeyen etiketler yok sayılır (bkz. `buildFlavorTrend`
 * ile aynı davranış). Hiç etiket yoksa boş bir harita döner.
 */
export function buildCategoryPreferences(notes: NoteTagsInput[]): CategoryPreferences {
  const counts = new Map<string, number>();
  let total = 0;

  for (const note of notes) {
    const allTags = [...note.noseTags, ...note.palateTags, ...note.finishTags];
    for (const tag of allTags) {
      const cat = categoryForTag(tag);
      if (!cat) continue;
      counts.set(cat.category, (counts.get(cat.category) ?? 0) + 1);
      total += 1;
    }
  }

  const weights = new Map<string, number>();
  if (total > 0) {
    counts.forEach((count, category) => {
      weights.set(category, count / total);
    });
  }

  return { weights, totalTags: total };
}

export interface FlavorMatchResult {
  /** 0-1 arası — viskinin kapsadığı kategorilerin kullanıcı ağırlıkları toplamı */
  score: number;
  /** Skora katkı veren, kullanıcının damak profilinde de yer alan kategoriler */
  matchedCategories: string[];
}

/**
 * Bir viskinin `flavorProfile` alanını kullanıcının kategori tercihleriyle
 * karşılaştırır. Viskinin aynı kategoriden birden çok terimi olsa da (ör.
 * "honey" ve "toffee" ikisi de "sweet") kategori yalnızca bir kez sayılır —
 * geniş flavorProfile dizisine sahip viskiler haksız avantaj kazanmaz.
 */
export function scoreByFlavorProfile(
  flavorProfile: string[],
  preferences: CategoryPreferences
): FlavorMatchResult {
  const whiskeyCategories = new Set<string>();
  for (const term of flavorProfile) {
    const category = categoryForFlavorTerm(term);
    if (category) whiskeyCategories.add(category);
  }

  let score = 0;
  const matchedCategories: string[] = [];
  whiskeyCategories.forEach((category) => {
    const weight = preferences.weights.get(category);
    if (weight) {
      score += weight;
      matchedCategories.push(category);
    }
  });

  // En güçlü eşleşme başta olsun — UI'da "en çok bu yüzden önerildi" sırası
  matchedCategories.sort(
    (a, b) => (preferences.weights.get(b) ?? 0) - (preferences.weights.get(a) ?? 0)
  );

  return { score, matchedCategories };
}
