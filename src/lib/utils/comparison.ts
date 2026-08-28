/**
 * @file comparison.ts
 * @description Pure helpers for whisky comparison. The comparison state is not
 * persisted — it lives in the URL's query parameters, which makes the link
 * shareable, keeps the back button working, and needs no new model.
 */

/** The most whiskies that can be compared at once. */
export const MAX_COMPARE_ITEMS = 3;

/**
 * Turns the URL's `whisky` parameter into a clean list of slugs.
 *
 * Next.js hands repeated query parameters over as `string | string[]`; both are
 * handled. Duplicates are dropped and the list is trimmed to the limit — the
 * URL may have been edited by hand, so the input is not trusted.
 */
export function parseCompareSlugs(param: string | string[] | undefined): string[] {
  const raw = param === undefined ? [] : Array.isArray(param) ? param : [param];

  const seen = new Set<string>();
  const slugs: string[] = [];

  for (const value of raw) {
    const slug = typeof value === "string" ? value.trim() : "";
    if (!slug || seen.has(slug)) continue;

    seen.add(slug);
    slugs.push(slug);

    if (slugs.length === MAX_COMPARE_ITEMS) break;
  }

  return slugs;
}

/**
 * Finds the aroma terms shared by every whisky being compared (the
 * intersection).
 *
 * With a single whisky an intersection is meaningless — there is nothing to
 * compare against — so it returns an empty set. The terms all come from the
 * catalogue's own vocabulary, so exact string matching is enough.
 */
export function findSharedFlavors(flavorProfiles: string[][]): Set<string> {
  if (flavorProfiles.length < 2) return new Set();

  let shared = new Set(flavorProfiles[0]);

  for (let i = 1; i < flavorProfiles.length; i++) {
    const current = new Set(flavorProfiles[i]);
    shared = new Set(Array.from(shared).filter((term) => current.has(term)));
    if (shared.size === 0) break;
  }

  return shared;
}

/**
 * Builds the comparison page's link from a list of slugs.
 * An empty list returns the bare path, keeping the URL clean.
 */
export function buildCompareHref(slugs: string[], basePath = "/compare"): string {
  if (slugs.length === 0) return basePath;

  const params = new URLSearchParams();
  for (const slug of slugs) params.append("whisky", slug);

  return `${basePath}?${params.toString()}`;
}
