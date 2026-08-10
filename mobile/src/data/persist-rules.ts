/**
 * @file persist-rules.ts
 * @description Hangi sorgunun diske yazılacağına karar verir — SAF.
 *
 * Bu fonksiyon aynı zamanda bir GİZLİLİK SINIRI. Cihazda kalıcı olarak duracak
 * şeyi burası belirliyor, o yüzden ağdan ve depodan ayrı duruyor ve testi var.
 *
 * Karar (kullanıcıyla konuşuldu): kendi tadım notların + katalog + kendi
 * istatistiklerin saklanır. Başkalarının verisi — akış, profiller — saklanmaz.
 */

/** Kalıcı depoya yazılacak sorgu kökleri. */
const PERSISTED_ROOTS = ["whiskeys", "aromaWheel", "dashboard", "analytics"] as const;

export function shouldPersistQuery(queryKey: readonly unknown[]): boolean {
  const [root, scope] = queryKey;

  if (typeof root !== "string") return false;

  // Katalog: paylaşımlı ve kişisel değil. Çevrimdışı asıl değerli senaryo bu —
  // barda çekmezken şişenin künyesine bakmak.
  //
  // Panel ve istatistikler: kullanıcının KENDİ notlarından hesaplanıyor, yani
  // "kendi notların saklanır" kuralının aynısı. Başkasının verisi içermiyor.
  if ((PERSISTED_ROOTS as readonly string[]).includes(root)) return true;

  // Öneriler saklanmıyor — burada teknik bir engel yok, bilinçli bir tercih.
  // Liste sunucuda damak profilinden hesaplanıyor ve her yeni notla değişiyor;
  // çevrimdışı gösterilen kopya "sana bunu öneriyoruz" diye duran ama artık
  // geçerli olmayan bir liste olurdu. Katalog zaten saklanıyor, kaybedilen tek
  // şey sıralama.

  // Tadım notlarının YALNIZCA kendi listem dalı saklanır.
  //
  // `detail` saklanmıyor çünkü aynı anahtar akıştan açılan BAŞKASININ notu için
  // de kullanılıyor; anahtara bakarak ikisini ayırmak mümkün değil. Bedeli:
  // çevrimdışıyken listeden bir nota dokunmak hata verir. Liste kartı zaten
  // viski, puan ve tarihi gösteriyor.
  if (root === "tastingNotes") return scope === "mine";

  // Akış ve kullanıcılar: başkalarının notları ve profilleri. Asla.
  return false;
}
