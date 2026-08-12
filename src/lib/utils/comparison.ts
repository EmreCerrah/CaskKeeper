/**
 * @file comparison.ts
 * @description Viski karşılaştırma için saf yardımcılar. Karşılaştırma durumu
 * kalıcı değildir — URL query parametrelerinde tutulur (paylaşılabilir link,
 * geri tuşu uyumlu, yeni model gerekmez).
 */

/** Aynı anda karşılaştırılabilecek en fazla viski sayısı. */
export const MAX_COMPARE_ITEMS = 3;

/**
 * URL'deki `whisky` parametresini temiz bir slug listesine çevirir.
 *
 * Next.js tekrar eden query parametrelerini `string | string[]` olarak verir;
 * ikisi de desteklenir. Yinelenen slug'lar atılır ve liste üst sınıra kırpılır —
 * URL elle düzenlenmiş olabilir, bu yüzden girdiye güvenilmez.
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
 * Karşılaştırılan tüm viskilerde ortak olan aroma terimlerini bulur (kesişim).
 *
 * Tek viski varken kesişim anlamsızdır — karşılaştırılacak bir şey yoktur —
 * bu yüzden boş küme döner. Terimler kataloğun aynı kelime dağarcığından
 * geldiği için birebir string eşleşmesi yeterlidir.
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
 * Verilen slug listesinden karşılaştırma sayfasının bağlantısını üretir.
 * Boş listede parametresiz yol döner (temiz URL).
 */
export function buildCompareHref(slugs: string[], basePath = "/compare"): string {
  if (slugs.length === 0) return basePath;

  const params = new URLSearchParams();
  for (const slug of slugs) params.append("whisky", slug);

  return `${basePath}?${params.toString()}`;
}
