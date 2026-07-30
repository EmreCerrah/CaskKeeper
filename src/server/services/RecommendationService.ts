/**
 * @file RecommendationService.ts
 * @description Kullanıcının tadım geçmişinden çıkarılan damak profiline göre
 * katalogdan viski önerir. Henüz tadılmamış viskiler arasından, kullanıcının
 * en çok seçtiği aroma kategorilerine en çok denk düşenler sıralanır.
 */

import { tastingNoteRepository } from "../repositories/TastingNoteRepository";
import { whiskeyRepository } from "../repositories/WhiskeyRepository";
import { buildCategoryPreferences, scoreByFlavorProfile } from "@/lib/utils/recommendations";
import { labelForCategory } from "@/lib/constants/aroma-wheel";
import { toWhiskeyDTO, type RecommendationDTO } from "@/lib/types/dto";

const DEFAULT_LIMIT = 8;

export class RecommendationService {
  /**
   * Skoru sıfırdan büyük olan viskileri azalan skora göre döner.
   * Kullanıcının kategori eşlemesi bulunan hiç etiketi yoksa (yeni kullanıcı
   * ya da hiç aroma etiketi seçmemiş) boş liste döner — anlamsız bir öneri
   * üretmek yerine.
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
