/**
 * @file RecommendationService.ts
 * @description Recommends whiskies from the catalogue against the palate
 * profile derived from the user's tasting history. Among the whiskies they have
 * not tried, the ones matching their most-chosen aroma categories rank
 * highest.
 */

import { tastingNoteRepository } from "../repositories/TastingNoteRepository";
import { whiskeyRepository } from "../repositories/WhiskeyRepository";
import { buildCategoryPreferences, scoreByFlavorProfile } from "@/lib/utils/recommendations";
import { labelForCategory } from "@/lib/constants/aroma-wheel";
import { toWhiskeyDTO, type RecommendationDTO } from "@/lib/types/dto";

const DEFAULT_LIMIT = 8;

export class RecommendationService {
  /**
   * Returns the whiskies scoring above zero, highest first.
   * If none of the user's tags map to a category — a new user, or one who has
   * never picked an aroma tag — it returns an empty list rather than
   * manufacturing a meaningless suggestion.
   */
  async getRecommendations(userId: string, limit = DEFAULT_LIMIT): Promise<RecommendationDTO[]> {
    const [tagNotes, tastedIds] = await Promise.all([
      tastingNoteRepository.findTagsByUser(userId),
      tastingNoteRepository.findTastedWhiskeyIds(userId),
    ]);

    const preferences = buildCategoryPreferences(tagNotes);
    if (preferences.totalTags === 0) return [];

    const candidates = await whiskeyRepository.findRecommendationCandidates(tastedIds);

    return candidates
      .map((whiskey) => {
        const { score, matchedCategories } = scoreByFlavorProfile(whiskey.flavorProfile, preferences);
        return { whiskey, score, matchedCategories };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((r) => ({
        whiskey: toWhiskeyDTO(r.whiskey),
        score: Math.round(r.score * 100) / 100,
        matchedCategories: r.matchedCategories.map((category) => ({
          category,
          label: labelForCategory(category),
        })),
      }));
  }
}

export const recommendationService = new RecommendationService();
