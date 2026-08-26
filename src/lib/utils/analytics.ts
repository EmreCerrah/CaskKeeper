/**
 * @file analytics.ts
 * @description Helpers that derive statistics from tasting notes. There is no
 * database dependency — the repository fetches the raw data and it is processed
 * here with pure functions, which keeps it easy to test.
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
 * Groups tasting notes by month and counts the tags per aroma category within
 * each. Tags that cannot be mapped (uncatalogued ones) are ignored. Returned in
 * chronological order, with each month's categories sorted by count,
 * descending.
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
