import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { queryKeys } from "./keys";
import type { Whiskey } from "./whiskeys";

/**
 * @file dashboard.ts
 * @description Kendi istatistiklerine ve önerilere erişimin tek yolu.
 *
 * Üçü de kişisel veri: her istek oturum token'ı taşıyor, token AuthContext'ten
 * geliyor. Ekranlar apiRequest görmez (bkz. whiskeys.ts'teki gerekçe).
 */

/**
 * Sunucunun DashboardStatsDTO'sundan mobilin kullandığı alanlar.
 * Bilerek kopya — mobil web'in dto.ts'ini import etmiyor (ayrı repo kuralı).
 *
 * `recentNotes` kasıtlı olarak DIŞARIDA: paneldeki son tadımlar listesinin
 * mobil karşılığı Tadımlarım sekmesi, aynı liste iki yerde çizilmiyor.
 */
export interface DashboardStats {
  totalNotes: number;
  distinctWhiskeys: number;
  averageRating: number | null;
  favoriteCount: number;
  topFlavorTags: { tag: string; count: number }[];
}

export interface FlavorTrendCategory {
  /** "fruity", "smoky_peaty" … — etiketi istemci bu kimlikten çeviriyor. */
  category: string;
  count: number;
  // NOT: sunucu bir de `label` gönderiyor ama TÜRKÇE üretiliyor; mobilde
  // kullanılmıyor, bkz. i18n/aroma.ts.
}

export interface FlavorTrendPoint {
  /** "YYYY-MM" */
  period: string;
  total: number;
  categories: FlavorTrendCategory[];
}

export interface DistributionItem {
  label: string;
  count: number;
}

export interface Analytics {
  flavorTrend: FlavorTrendPoint[];
  distribution: {
    byType: DistributionItem[];
    byRegion: DistributionItem[];
    byDistillery: DistributionItem[];
  };
}

export interface Recommendation {
  whiskey: Whiskey;
  /** 0-1 arası eşleşme skoru. */
  score: number;
  matchedCategories: { category: string }[];
}

/** Panelin özet sayıları ve damak profili. */
export function useDashboard() {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.dashboard(),
    queryFn: () => apiRequest<DashboardStats>("/api/dashboard", { token }),
    enabled: Boolean(token),
  });
}

/** Aylık aroma trendi ve katalog dağılımı. */
export function useAnalytics() {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.analytics(),
    queryFn: () => apiRequest<Analytics>("/api/analytics", { token }),
    enabled: Boolean(token),
  });
}

/** Damak profiline göre henüz tadılmamış viskiler. */
export function useRecommendations() {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.recommendations(),
    queryFn: () => apiRequest<Recommendation[]>("/api/recommendations", { token }),
    enabled: Boolean(token),
  });
}
