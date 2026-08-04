/**
 * @file tr.ts
 * @description Türkçe arayüz metinleri — sözlüğün KAYNAK dili.
 *
 * Anahtarlar noktalı ve İngilizce (kod İngilizce kuralı); değerler kullanıcının
 * gördüğü metin. Yeni bir anahtar önce buraya eklenir; en.ts aynı anahtar
 * kümesini taşımak zorundadır ve bir test bunu doğrular.
 *
 * `{ad}` biçimindeki yer tutucular t()'ye verilen parametrelerle değiştirilir.
 */
export const tr = {
  // --- Gezinme -----------------------------------------------------------
  "nav.whiskies": "Viskiler",
  "nav.people": "Kişiler",
  "nav.dashboard": "Panelim",
  "nav.feed": "Akış",
  "nav.myTastings": "Tadımlarım",
  "nav.favorites": "Favorilerim",
  "nav.wishlist": "İstek Listem",
  "nav.wishlistShort": "İstek",
  "nav.compare": "Karşılaştır",
  "nav.compareLong": "Viski Karşılaştır",
  "nav.notifications": "Bildirimler",
  "nav.login": "Giriş Yap",
  "nav.loginShort": "Giriş",
  "nav.register": "Kayıt Ol",
  "nav.publicProfile": "Herkese Açık Profilim",
  "nav.profileSettings": "Profil Ayarları",
  "nav.admin": "Yönetim",
  "nav.logout": "Çıkış Yap",
  "nav.more": "Daha fazla",
  "nav.menu": "Menü",

  // --- Erişilebilirlik etiketleri ----------------------------------------
  "a11y.mobileNav": "Mobil gezinme",
  "a11y.closeMenu": "Menüyü kapat",
  "a11y.close": "Kapat",
  "a11y.otherPages": "Diğer sayfalar",
  "a11y.userMenu": "Kullanıcı menüsü",

  // --- Dil değiştirici ---------------------------------------------------
  "locale.label": "Dil",
  "locale.tr": "Türkçe",
  "locale.en": "İngilizce",
  "locale.switchToTr": "Arayüzü Türkçeye çevir",
  "locale.switchToEn": "Arayüzü İngilizceye çevir",

  // --- Çevrimdışı kullanım ------------------------------------------------
  "offline.title": "Çevrimdışı Kullanım",
  "offline.on": "Açık",
  "offline.off": "Kapalı",
  "offline.switchOnLabel": "Çevrimdışı kullanım açık",
  "offline.switchOffLabel": "Çevrimdışı kullanım kapalı",
  "offline.actionFailed": "İşlem tamamlanamadı.",

  // --- Alt bilgi ----------------------------------------------------------
  "footer.tagline": "Viski tadım günlüğünüz — keşfedin, tadın, kaydedin.",
  "footer.disclaimer": "İçkinin tadını çıkarın, sorumlu tüketin.",

  // --- Site üst verisi ----------------------------------------------------
  "meta.title": "CaskKeeper — Viski Tadım Günlüğünüz",
  "meta.description":
    "Viskileri keşfedin, tadım deneyimlerinizi kaydedin, zaman içinde karşılaştırın. Premium viski tadım günlüğü.",
} as const;

export type TranslationKey = keyof typeof tr;
