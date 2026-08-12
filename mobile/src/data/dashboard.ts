import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { queryKeys } from "./keys";
import type { Whiskey } from "./whiskeys";

/**
 * @file dashboard.ts
 * @description The only way into your own statistics and recommendations.
 *
 * All three are personal data: every request carries the session token, taken
 * from AuthContext. Screens never see apiRequest (see the reasoning in
 * whiskeys.ts).
 */

/**
 * The fields of the server's DashboardStatsDTO the app uses.
 * A deliberate copy — the app does not import the web's dto.ts (separate
 * repository rule).
 *
 * `recentNotes` is deliberately LEFT OUT: the mobile equivalent of the
 * dashboard's recent-tastings list is the My Tastings tab, and the same list
 * is not drawn twice.
 */
export interface DashboardStats {
  totalNotes: number;
  distinctWhiskeys: number;
  averageRating: number | null;
  favoriteCount: number;
  topFlavorTags: { tag: string; count: number }[];
}

export interface FlavorTrendCategory {
  /** "fruity", "smoky_peaty" … — the client translates the label from this id. */
  category: string;
  count: number;
  // NOTE: the server also sends a `label`, but it is generated in TURKISH; the
  // app does not use it — see i18n/aroma.ts.
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
  /** Match score between 0 and 1. */
  score: number;
  matchedCategories: { category: string }[];
}

/** The dashboard summary figures and palate profile. */
export function useDashboard() {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.dashboard(),
    queryFn: () => apiRequest<DashboardStats>("/api/dashboard", { token }),
    enabled: Boolean(token),
  });
}

/** Monthly aroma trend and catalogue distribution. */
export function useAnalytics() {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.analytics(),
    queryFn: () => apiRequest<Analytics>("/api/analytics", { token }),
    enabled: Boolean(token),
  });
}

/** Whiskies not yet tasted, ranked against the palate profile. */
export function useRecommendations() {
  const { token } = useAuth();

  return useQuery({
    queryKey: queryKeys.recommendations(),
    queryFn: () => apiRequest<Recommendation[]>("/api/recommendations", { token }),
    enabled: Boolean(token),
  });
}
