/**
 * @file analytics.ts
 * @description Tadım notlarından istatistik türetme yardımcıları. Veritabanı
 * bağımlılığı yoktur — repository ham veriyi çeker, burada saf fonksiyonlarla
 * işlenir (test edilmesi kolay olsun diye).
 */

import { categoryForTag } from "@/lib/constants/aroma-wheel";
import type { FlavorTrendPointDTO } from "@/lib/types/dto";

export interface NoteTagsInput {
  tastingDate: Date | string;
  noseTags: string[];
  palateTags: string[];
  finishTags: string[];
}

/**
 * Tadım notlarını aya göre gruplar, her ayda aroma kategorisi başına
 * etiket sayısını çıkarır. Eşlenemeyen (kataloglanmamış) etiketler yok sayılır.
 * Kronolojik sırayla döner; her ayın kategorileri sayıya göre azalan sıralanır.
 */
export function buildFlavorTrend(notes: NoteTagsInput[]): FlavorTrendPointDTO[] {
  const monthMap = new Map<string, Map<string, { label: string; count: number }>>();

  for (const note of notes) {
    const period = new Date(note.tastingDate).toISOString().slice(0, 7); // YYYY-MM
    let bucket = monthMap.get(period);
    if (!bucket) {
      bucket = new Map();
      monthMap.set(period, bucket);
    }

    const allTags = [...note.noseTags, ...note.palateTags, ...note.finishTags];
    for (const tag of allTags) {
      const cat = categoryForTag(tag);
      if (!cat) continue;

      const existing = bucket.get(cat.category);
      if (existing) {
        existing.count += 1;
      } else {
        bucket.set(cat.category, { label: cat.label, count: 1 });
      }
    }
  }

  return Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, categories]) => {
      const categoryList = Array.from(categories.entries())
        .map(([category, v]) => ({ category, label: v.label, count: v.count }))
        .sort((a, b) => b.count - a.count);

      return {
        period,
        total: categoryList.reduce((sum, c) => sum + c.count, 0),
        categories: categoryList,
      };
    });
}
