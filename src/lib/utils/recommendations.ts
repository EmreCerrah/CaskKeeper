/**
 * @file recommendations.ts
 * @description The pure calculations behind the recommendation engine. There
 * is no database dependency — the repository fetches the raw data and it is
 * processed here.
 *
 * The approach: a "palate profile" is derived from the aroma tags in the user's
 * tasting notes — a normalised weight per category, summing to 1. Each
 * candidate whisky is compared against that profile through the unique
 * categories its `flavorProfile` terms belong to, and the score is the sum of
 * the user's weights for the categories it covers (between 0 and 1).
 */

import { categoryForTag } from "@/lib/constants/aroma-wheel";
import { categoryForFlavorTerm } from "@/lib/constants/flavor-profile-map";
import type { NoteTagsInput } from "./analytics";

export interface CategoryPreferences {
  /** category id → a normalised weight from 0 to 1, summing to 1 (or 0 when empty) */
  weights: Map<string, number>;
  /** How many of the user's tags map to a category in total */
  totalTags: number;
}

/**
 * Counts every aroma tag in the tasting notes by category and normalises the
 * result. Tags that cannot be mapped are ignored (the same behaviour as
 * `buildFlavorTrend`). With no tags at all it returns an empty map.
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
  /** 0 to 1 — the sum of the user's weights for the categories this whisky covers */
  score: number;
  /** The categories behind the score, the ones also in the user's palate profile */
  matchedCategories: string[];
}

/**
 * Compares a whisky's `flavorProfile` against the user's category preferences.
 * Even when a whisky has several terms from one category — "honey" and
 * "toffee" are both "sweet" — the category counts once, so whiskies with a long
 * flavorProfile array gain no unfair advantage.
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

  // Strongest match first — the "mostly why this was suggested" order in the UI
  matchedCategories.sort(
    (a, b) => (preferences.weights.get(b) ?? 0) - (preferences.weights.get(a) ?? 0)
  );

  return { score, matchedCategories };
}
