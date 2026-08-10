import type { DistributionItem, FlavorTrendPoint } from "../data/dashboard";

/**
 * @file chart-math.ts
 * @description Grafiklerin genişlik hesapları — SAF.
 *
 * Bileşenlerden ayrı: React Native modülleri Node altında kurulamıyor, oysa
 * sınanmaya değen kısım tam olarak burası. Grafiklerde yanlış bir yüzde hata
 * vermez, sadece yanlış bir resim çizer — testin yakalaması gereken tür.
 *
 * Tipler `import type` ile geliyor, yani derlemede siliniyor; bu dosya
 * çalışma zamanında hiçbir şey import etmiyor.
 */

export interface BarSlice {
  /** Kategori kimliği ya da dağılım etiketi — anahtar olarak da kullanılır. */
  key: string;
  count: number;
  /** 0-100 arası genişlik yüzdesi. */
  widthPct: number;
}

/**
 * Dağılım listesinin bar genişlikleri — EN BÜYÜK değere göre ölçekli.
 *
 * Toplama göre değil: tek serili bir listede en büyük öğenin barı tam
 * genişlikte olmalı, yoksa sekiz damıtımevi olduğunda hepsi ince birer çizgiye
 * dönüşür ve karşılaştırma okunmaz olur.
 */
export function distributionBars(items: DistributionItem[]): BarSlice[] {
  const max = items.reduce((acc, item) => Math.max(acc, item.count), 0);

  return items.map((item) => ({
    key: item.label,
    count: item.count,
    // max === 0: sunucu sıfır sayılı öğe döndürmemeli ama döndürürse
    // sıfıra bölme NaN üretir ve bar hiç çizilmez.
    widthPct: max > 0 ? (item.count / max) * 100 : 0,
  }));
}

/**
 * Bir ayın yığılmış bar segmentleri — o ayın TOPLAMINA göre ölçekli.
 *
 * Burada oran anlamlı: her ay tam genişliği doldurur, aylar arası
 * karşılaştırma "hangi ay daha çok" değil "o ay ne yönde" sorusuna cevap verir.
 */
export function trendSegments(point: FlavorTrendPoint): BarSlice[] {
  // `total` sunucudan geliyor ama kategorilerin toplamıyla tutarsız olabilir
  // (ör. bir kategori ilk N dışında kalırsa). Çizimde payda olarak gerçek
  // toplam kullanılıyor ki segmentler barı taşırmasın ya da eksik bırakmasın.
  const sum = point.categories.reduce((acc, cat) => acc + cat.count, 0);

  if (sum <= 0) return [];

  return point.categories.map((cat) => ({
    key: cat.category,
    count: cat.count,
    widthPct: (cat.count / sum) * 100,
  }));
}

/**
 * Grafikte görünen kategoriler, İLK GÖRÜLDÜKLERİ ayın sırasına göre.
 *
 * Alfabetik değil: lejant sırası grafikteki segment sırasını takip etsin,
 * kullanıcı renkleri soldan sağa eşleştirebilsin diye.
 */
export function trendLegend(trend: FlavorTrendPoint[]): string[] {
  const seen: string[] = [];

  for (const point of trend) {
    for (const cat of point.categories) {
      if (!seen.includes(cat.category)) seen.push(cat.category);
    }
  }

  return seen;
}
