import type { TranslationKey } from "./dictionaries";

/**
 * @file aroma.ts
 * @description Aroma kategorisi kimliğini çeviri anahtarına çevirir — SAF.
 *
 * Sunucu istatistik uçlarında kategoriyi hem `category` (kimlik) hem `label`
 * ile gönderiyor, ama `label` TÜRKÇE üretiliyor ("Meyvemsi (Fruity)"). Cihazı
 * İngilizce olan bir kullanıcıya o metni göstermek arayüzün ortasında Türkçe
 * bir ada bırakırdı, o yüzden mobil `label` alanını hiç kullanmıyor.
 *
 * `t()` bilerek yalnızca `TranslationKey` kabul ediyor (eksik anahtar derleme
 * hatası olsun diye), yani `"aroma." + category` gibi bir birleştirme geçmez.
 * Eşleme bu yüzden burada, tek yerde ve tip güvenli.
 */

const CATEGORY_KEYS: Record<string, TranslationKey> = {
  fruity: "aroma.fruity",
  floral: "aroma.floral",
  woody: "aroma.woody",
  sweet: "aroma.sweet",
  spicy: "aroma.spicy",
  smoky_peaty: "aroma.smoky_peaty",
  nutty: "aroma.nutty",
  cereal: "aroma.cereal",
  feinty_other: "aroma.feinty_other",
};

/**
 * Bilinmeyen kimlik "Diğer"e düşer.
 *
 * Kataloğa yeni bir kategori eklenirse mobil sürüm güncellenene kadar o
 * kategoriyi "Diğer" diye gösterir — ham kimliği ("smoky_peaty") ekranda
 * göstermekten iyi.
 */
export function aromaCategoryKey(category: string): TranslationKey {
  return CATEGORY_KEYS[category] ?? "aroma.feinty_other";
}
