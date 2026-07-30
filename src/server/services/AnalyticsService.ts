/**
 * @file AnalyticsService.ts
 * @description Kullanıcının tadım geçmişinden türetilen detaylı istatistikler
 * (aroma trendi, katalog dağılımı). Panel'deki hızlı özetten (TastingNoteService.
 * getDashboardStats) ayrı tutulur — burası daha ağır, isteğe bağlı analiz sayfası içindir.
 */

import { tastingNoteRepository } from "../repositories/TastingNoteRepository";
import { buildFlavorTrend } from "@/lib/utils/analytics";
import type { AnalyticsDTO } from "@/lib/types/dto";

export class AnalyticsService {
  async getAnalytics(userId: string): Promise<AnalyticsDTO> {
    const [tagNotes, distribution] = await Promise.all([
      tastingNoteRepository.findTagsByUser(userId),
      tastingNoteRepository.getCatalogDistributionByUser(userId),
    ]);

    return {
      flavorTrend: buildFlavorTrend(tagNotes),
      distribution,
    };
  }
}

export const analyticsService = new AnalyticsService();
