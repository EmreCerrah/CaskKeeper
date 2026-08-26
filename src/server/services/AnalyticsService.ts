/**
 * @file AnalyticsService.ts
 * @description The detailed statistics derived from a user's tasting history
 * (the aroma trend, the catalogue distribution). Kept apart from the quick
 * summary on the dashboard (TastingNoteService.getDashboardStats) — this is the
 * heavier work, for the optional analysis page.
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
