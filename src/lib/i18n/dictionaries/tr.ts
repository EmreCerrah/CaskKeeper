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

  // --- Ortak eylemler -----------------------------------------------------
  "common.search": "Ara",
  "common.clearSearch": "Aramayı temizle",
  "common.pagination": "Sayfalama",
  "common.yes": "Evet",
  "common.no": "Hayır",
  "common.searchFailed": "Arama başarısız",

  // --- Giriş / Kayıt ------------------------------------------------------
  "auth.login.heading": "Tekrar Hoş Geldiniz",
  "auth.login.subtitle": "Tadım günlüğünüze devam etmek için giriş yapın.",
  "auth.login.noAccount": "Hesabınız yok mu?",
  "auth.login.registerLink": "Kayıt olun",
  "auth.login.submit": "Giriş Yap",
  "auth.login.failed": "Giriş yapılamadı",

  "auth.register.heading": "Günlüğünüzü Başlatın",
  "auth.register.subtitle": "Ücretsiz hesap oluşturun, ilk tadım notunuzu bugün yazın.",
  "auth.register.submit": "Hesap Oluştur",
  "auth.register.failed": "Kayıt oluşturulamadı",
  "auth.register.hasAccount": "Zaten hesabınız var mı?",
  "auth.register.loginLink": "Giriş yapın",

  "auth.field.name": "İsim",
  "auth.field.namePlaceholder": "Adınız Soyadınız",
  "auth.field.email": "E-posta",
  "auth.field.emailPlaceholder": "ornek@eposta.com",
  "auth.field.password": "Parola",
  "auth.field.passwordConfirm": "Parola (Tekrar)",
  "auth.showPassword": "Parolayı göster",
  "auth.hidePassword": "Parolayı gizle",

  "auth.validation.nameMin": "İsim en az 2 karakter olmalı",
  "auth.validation.nameMax": "İsim en fazla 60 karakter olabilir",
  "auth.validation.email": "Geçerli bir e-posta adresi giriniz",
  "auth.validation.passwordMin": "Parola en az 8 karakter olmalı",
  "auth.validation.passwordMax": "Parola en fazla 72 karakter olabilir",
  "auth.validation.passwordRequired": "Parola zorunludur",
  "auth.validation.passwordMismatch": "Parolalar eşleşmiyor",

  // --- Viski kataloğu -----------------------------------------------------
  "catalogue.title": "Viski Kataloğu",
  "catalogue.count": "{count} viski arasından keşfedin.",
  "catalogue.empty": "Katalog şu an boş görünüyor.",
  "catalogue.noResults": "Aradığınız kriterlere uygun viski bulunamadı.",
  "catalogue.searchPlaceholder": "Marka, isim veya damıtımevi ara…",
  "catalogue.searchLabel": "Viski ara",
  "catalogue.filterType": "Tip filtresi",
  "catalogue.filterRegion": "Bölge filtresi",
  "catalogue.filterCountry": "Ülke filtresi",
  "catalogue.allTypes": "Tüm Tipler",
  "catalogue.allRegions": "Tüm Bölgeler",
  "catalogue.allCountries": "Tüm Ülkeler",
  "catalogue.limitedEdition": "Limitli Üretim",

  // --- Viski detayı -------------------------------------------------------
  "whiskey.notFound": "Viski Bulunamadı",
  "whiskey.abv": "Alkol Oranı",
  "whiskey.age": "Yaş",
  "whiskey.ageYears": "{age} Yıl",
  "whiskey.distillery": "Damıtımevi",
  "whiskey.caskType": "Fıçı Tipi",
  "whiskey.bottlingYear": "Şişeleme Yılı",
  "whiskey.region": "Bölge",
  "whiskey.country": "Ülke",
  "whiskey.wishlistAdd": "İstek Listeme Ekle",
  "whiskey.wishlistAdded": "İstek Listemde",
  "whiskey.type": "Tip",
  "whiskey.vintage": "Rekolte",
  "whiskey.backToCatalogue": "Kataloğa Dön",
  "whiskey.flavorProfile": "Aroma Profili",
  "whiskey.awards": "Ödüller",
  "whiskey.writeNote": "Tadım Notu Yaz",
  "whiskey.officialPage": "Resmî Sayfa",
  "whiskey.myNotesTitle": "Bu Viskiye Ait Tadımlarım",
  "whiskey.noNotesYet":
    "Bu viskiyi henüz tatmadınız. İlk tadım notunuzu yazmak için yukarıdaki butonu kullanın.",

  // --- Karşılaştırma ------------------------------------------------------
  "compare.title": "Viski Karşılaştırma",
  "compare.empty": "Karşılaştırma henüz boş.",
  "compare.exploreCatalogue": "Kataloğu Keşfet",
  "compare.addPlaceholder": "Karşılaştırmaya viski ekle — marka, isim veya damıtımevi ara…",
  "compare.addLabel": "Karşılaştırmaya eklenecek viskiyi ara",
  "compare.noMatches": "Eşleşen viski bulunamadı.",
  "compare.property": "Özellik",
  "compare.sharedNotesCaption": "hangi notalar örtüşüyor",
  "compare.sharedNoteTitle": "Tüm karşılaştırılan viskilerde ortak",
  "compare.subtitle": "En fazla {max} viskiyi yan yana inceleyin. Ortak aroma notaları vurgulanır.",
  "compare.emptyHint":
    "Yukarıdaki arama kutusundan viski ekleyin ya da katalogdan bir viski seçip “Karşılaştır” butonunu kullanın.",
  "compare.addOneMore": "Ortak aroma notalarını görmek için en az bir viski daha ekleyin.",
  "compare.remove": "Çıkar",
  "compare.tableCaption": "Seçili viskilerin teknik özellik ve aroma profili karşılaştırması",
  "compare.sharedLabel": "ortak",
  "compare.brand": "Marka",

  // --- Kişiler ------------------------------------------------------------
  "people.title": "Kişiler",
  "people.friend": "Arkadaş",
  "people.followsYou": "Sizi takip ediyor",
  "people.searchPlaceholder": "İsme göre kişi ara…",
  "people.searchLabel": "Kullanıcı ara",
  "people.noMatches": "“{query}” ile eşleşen kişi bulunamadı.",
  "people.noUsers": "Henüz başka kullanıcı yok.",
  "people.tryAnotherName": "Farklı bir isim deneyin.",
  "people.follow": "Takip Et",
  "people.unfollow": "Takibi Bırak",
  "people.loginToFollow": "Takip için giriş yapın",
  "people.subtitlePrefix": "Diğer viski tutkunlarını bulun, takip edin. Karşılıklı takip ettiğiniz kişiler",
  "people.subtitleSuffix": "olarak görünür.",
  "people.newMembers": "Yeni Katılanlar",
  "people.publicNoteCount": "{count} herkese açık tadım",
} as const;

export type TranslationKey = keyof typeof tr;
