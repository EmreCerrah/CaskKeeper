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
  "offline.syncFailed": "Veriler güncellenemedi.",
  "offline.cardDescription":
    "Açtığınızda tadım notlarınız ve istek listeniz bu cihaza kaydedilir ve güncel tutulur; internet bağlantınız olmadığında da okuyabilirsiniz. Kapattığınızda kayıtlı kopya hemen silinir.",
  "offline.unsupported": "Bu tarayıcı çevrimdışı kaydı desteklemiyor.",
  "offline.syncNow": "Şimdi güncelle",
  "offline.syncing": "Güncelleniyor…",
  "offline.lastSync": "Son senkron:",
  "offline.counts": "{notes} tadım notu, {wishlist} istek listesi kaydı",
  "offline.noData": "Bu cihazda kayıtlı çevrimdışı veri yok.",
  "offline.loading": "Yükleniyor…",
  "offline.noDataTitle": "Çevrimdışı veri yok",
  "offline.noDataBody":
    "Bu cihaza henüz veri indirilmemiş. Bağlantınız olduğunda panelinizdeki “Verilerimi indir” düğmesiyle tadım notlarınızı ve istek listenizi kaydedebilirsiniz.",
  "offline.goToDashboard": "Panele git",
  "offline.copyOwner": "{name} hesabının bu cihazdaki kopyası · son senkron {date}",
  "offline.backOnline": "Bağlantı geri geldi — panele dön",
  "offline.tabNotes": "Tadımlarım ({count})",
  "offline.tabWishlist": "İstek Listem ({count})",
  "offline.noNotes": "Kayıtlı tadım notu yok.",
  "offline.emptyWishlist": "İstek listeniz boş.",

  // --- Profil formu -------------------------------------------------------
  "profileForm.bioMax": "Hakkında yazısı en fazla 500 karakter olabilir",
  "profileForm.urlInvalid": "Geçerli bir URL giriniz",
  "profileForm.failed": "Profil güncellenemedi",
  "profileForm.emailFixed": "E-posta adresi değiştirilemez.",
  "profileForm.bio": "Hakkımda",
  "profileForm.bioPlaceholder": "Viski yolculuğunuzdan kısaca bahsedin…",
  "profileForm.picture": "Profil Fotoğrafı (URL)",
  "profileForm.saved": "Profiliniz güncellendi.",
  "profileForm.save": "Kaydet",

  // --- Aroma seçici -------------------------------------------------------
  "flavorPicker.removeHint": "Kaldırmak için tıklayın",

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
  "common.previous": "Önceki",
  "common.next": "Sonraki",
  "common.pageOf": "Sayfa",
  "common.searching": "Aranıyor…",
  "common.offline": "Çevrimdışı",

  // --- Göreli zaman -------------------------------------------------------
  "time.justNow": "az önce",
  "time.minutesAgo": "{count} dk önce",
  "time.hoursAgo": "{count} sa önce",
  "time.daysAgo": "{count} gün önce",
  "common.yes": "Evet",
  "common.no": "Hayır",
  "common.searchFailed": "Arama başarısız",

  // --- 404 ----------------------------------------------------------------
  "notFound.title": "Sayfa Bulunamadı",
  "notFound.body":
    "Aradığınız sayfa fıçıda dinlenmeye bırakılmış olabilir. Kataloğa dönüp keşfetmeye devam edin.",
  "notFound.cta": "Kataloğa Dön",

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

  // --- Viski kataloğu -----------------------------------------------------
  "catalogue.title": "Viski Kataloğu",
  "catalogue.count": "{count} viski arasından keşfedin.",
  "catalogue.empty": "Katalog şu an boş görünüyor.",
  "catalogue.noResults": "Aradığınız kriterlere uygun viski bulunamadı.",
  "catalogue.clearFilters": "Filtreleri temizleyip tekrar deneyin.",
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
  "compare.full": "En fazla {max} viski karşılaştırılabilir. Yenisini eklemek için birini çıkarın.",
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

  // --- Sosyal listeler ----------------------------------------------------
  "social.backToProfile": "{name} profiline dön",
  "social.followersTitle": "Takipçiler",
  "social.followersHeading": "{name} — Takipçiler ({count})",
  "social.followingTitle": "Takip Edilenler",
  "social.followingHeading": "{name} — Takip Edilenler ({count})",
  "social.noFollowers": "Henüz takipçi yok.",
  "social.noFollowing": "Henüz kimse takip edilmiyor.",

  // --- Tadım notu kalıcı bağlantısı ---------------------------------------
  "notePage.fallbackTitle": "Tadım notu",
  "notePage.fallbackAuthor": "Tadım",
  "notePage.notFound": "Tadım Notu Bulunamadı",

  // --- Öneri eşleşmesi ----------------------------------------------------
  "match.percent": "%{percent} eşleşme",

  // --- Aroma trendi -------------------------------------------------------
  "trend.empty":
    "Tadım notlarınızda aroma etiketi seçtikçe zaman içindeki değişim burada görünecek.",
  "trend.barLabel": "{period}: {count} aroma etiketi",
  "trend.month": "Ay",
  "trend.total": "Toplam",
  "trend.showTable": "Tablo görünümü",
  "trend.hideTable": "Tabloyu gizle",

  // --- Tadım notu kartı ---------------------------------------------------
  "note.public": "Herkese açık",
  "note.finishShort": "Kısa bitiş",
  "note.finishMedium": "Orta bitiş",
  "note.finishLong": "Uzun bitiş",
  "note.finishPrefix": "Bitiş",
  "note.noseLabel": "Burun",
  "note.palateLabel": "Damak",
  "note.favoriteAdd": "Favorilere ekle",
  "note.favoriteRemove": "Favorilerden çıkar",
  "note.edit": "Düzenle",
  "note.delete": "Sil",
  "note.deleteConfirm": "Silmeyi onaylamak için tekrar tıklayın",

  // --- Beğeni ve yorumlar -------------------------------------------------
  "interactions.likeFailed": "Beğeni güncellenemedi",
  "interactions.like": "Beğen",
  "interactions.unlike": "Beğeniyi kaldır",
  "interactions.likeSignIn": "Beğenmek için giriş yapmalısınız",
  "interactions.likeUnit": "beğeni",
  "interactions.commentUnit": "yorum",
  "interactions.showComments": "Yorumları göster",
  "interactions.hideComments": "Yorumları gizle",
  "interactions.openNote": "Notu aç",
  "interactions.loadingComments": "Yorumlar yükleniyor…",
  "interactions.noComments": "Henüz yorum yok. İlk yorumu siz yazın.",
  "interactions.commentPlaceholder": "Bu tadım hakkında ne düşünüyorsunuz?",
  "interactions.send": "Gönder",
  "interactions.signInToCommentBefore": "Yorum yazmak için",
  "interactions.signInToCommentLink": "giriş yapın",

  // --- Bildirimler --------------------------------------------------------
  "notifications.title": "Bildirimler",
  "notifications.unreadCount": "{count} okunmamış bildiriminiz var.",
  "notifications.allRead": "Tüm bildirimleriniz okundu.",
  "notifications.empty": "Henüz bildiriminiz yok.",
  "notifications.emptyHint":
    "Biri sizi takip ettiğinde, tadımınızı beğendiğinde ya da yorumladığında burada görünür.",
  "notifications.markAllRead": "Tümünü okundu işaretle",
  "notifications.unread": "Okunmamış",
  "notifications.bellWithCount": "Bildirimler — {count} okunmamış",
  "notifications.targetNamed": "“{whiskey}” tadımınızı",
  "notifications.targetGeneric": "tadım notunuzu",
  "notifications.follow": "sizi takip etmeye başladı",
  "notifications.like": "{target} beğendi",
  "notifications.comment": "{target} yorumladı",

  // --- Panel --------------------------------------------------------------
  "dashboard.title": "Panelim",
  "dashboard.welcome": "Hoş geldiniz,",
  "dashboard.subtitle": "İşte tadım yolculuğunuzun özeti.",
  "dashboard.startTasting": "Yeni Tadım Başlat",
  "dashboard.statTotal": "Toplam Tadım",
  "dashboard.statDistinct": "Farklı Viski",
  "dashboard.statAverage": "Ortalama Puan",
  "dashboard.statFavorites": "Favori Tadım",
  "dashboard.recentTastings": "Son Tadımlarınız",
  "dashboard.noNotes": "Henüz tadım notunuz yok.",
  "dashboard.noNotesHintBefore": "Katalogdan bir viski seçerek",
  "dashboard.noNotesHintAfter": "ilk notunuzu yazın.",
  "dashboard.palateProfile": "Damak Profiliniz",
  "dashboard.topFlavors": "En Çok Seçtiğiniz Aromalar",
  "dashboard.noFlavors":
    "Tadım notlarınızda aroma etiketi seçtikçe damak profiliniz burada şekillenecek.",
  "dashboard.detailedStats": "Detaylı İstatistikler",
  "dashboard.recommendations": "Sizin İçin Öneriler",
  "dashboard.back": "Panelime dön",

  // --- Yönetim ------------------------------------------------------------
  "admin.title": "Yönetim",
  "admin.catalogue": "Katalog",
  "admin.users": "Kullanıcılar",
  "admin.catalogueTitle": "Katalog Yönetimi",
  "admin.usersTitle": "Kullanıcı Yönetimi",
  "admin.usersSubtitleBefore": "Sistemde",
  "admin.usersSubtitleAfter":
    "kullanıcı var. Yönetici yetkisi verdiğiniz kişiler kataloğu düzenleyebilir.",
  "admin.roleAdmin": "Yönetici",
  "admin.roleGrant": "Yönetici Yap",
  "admin.roleRevoke": "Yetkiyi Kaldır",
  "admin.roleFailed": "Rol değiştirilemedi",
  "admin.whiskeySaveFailed": "Viski kaydedilemedi",
  "admin.deleteFailed": "Silinemedi",
  "admin.ownAccount": "Kendi hesabınız",
  "admin.emptyCatalogue": "Katalog boş.",
  "admin.emptyCatalogueHint": "Yeni viski ekleyin veya import script’ini çalıştırın.",
  "admin.newWhiskeyTitle": "Kataloğa Yeni Viski Ekle",
  "admin.newWhiskeyHint": "Slug marka, ürün adı ve damıtımevinden otomatik üretilir.",
  "admin.editWhiskeyTitle": "Viski Düzenle",
  "admin.editWhiskeyHint":
    "Marka, ürün adı veya damıtımevini değiştirirseniz slug yeniden üretilir.",
  "admin.deleteConfirm": "“{label}” silinecek — onaylamak için tekrar tıklayın",
  "admin.areYouSure": "Emin misiniz?",
  "whiskeyForm.identityCard": "Kimlik",
  "whiskeyForm.type": "Tip *",
  "whiskeyForm.technicalCard": "Teknik",
  "whiskeyForm.brand": "Marka *",
  "whiskeyForm.name": "Ürün Adı *",
  "whiskeyForm.distillery": "Damıtımevi *",
  "whiskeyForm.distilleryHint":
    "Bilinmiyorsa üreticiyi yazın — kimliğin parçasıdır, boş bırakılamaz.",
  "whiskeyForm.externalId": "Dış Kimlik (externalId)",
  "whiskeyForm.externalIdHint":
    "Kalıcı kimlik — sonradan isim düzeltirseniz kopya oluşmasını önler.",
  "whiskeyForm.classificationCard": "Sınıflandırma",
  "whiskeyForm.region": "Bölge *",
  "whiskeyForm.country": "Ülke *",
  "whiskeyForm.subRegion": "Alt Bölge",
  "whiskeyForm.abv": "Alkol Oranı (%) *",
  "whiskeyForm.age": "Yaş (yıl)",
  "whiskeyForm.caskType": "Fıçı Tipi",
  "whiskeyForm.bottlingYear": "Şişeleme Yılı",
  "whiskeyForm.vintage": "Rekolte",
  "whiskeyForm.limitedEdition": "Limitli Üretim",
  "whiskeyForm.contentCard": "İçerik",
  "whiskeyForm.description": "Açıklama",
  "whiskeyForm.flavorProfile": "Aroma Profili",
  "whiskeyForm.tags": "Etiketler",
  "whiskeyForm.awards": "Ödüller",
  "whiskeyForm.imageUrl": "Görsel URL",
  "whiskeyForm.officialUrl": "Resmî Sayfa URL",
  "whiskeyForm.commaHint": "Virgülle ayırın.",
  "whiskeyForm.cancel": "Vazgeç",
  "whiskeyForm.create": "Kataloğa Ekle",
  "whiskeyForm.saveChanges": "Değişiklikleri Kaydet",

  // --- İstatistikler ------------------------------------------------------
  "stats.title": "Detaylı İstatistikler",
  "stats.subtitle": "Damak zevkinizin zaman içindeki değişimi ve katalog tercihleriniz.",
  "stats.trendTitle": "Zaman İçinde Aroma Değişimi",
  "stats.byType": "Tipe Göre",
  "stats.byRegion": "Bölgeye Göre",
  "stats.topDistilleries": "En Çok Tadılan Damıtımevleri",
  "stats.empty": "Henüz tadım notunuz yok.",

  // --- Tadım notu formu ---------------------------------------------------
  "noteForm.newTitle": "Yeni Tadım Notu",
  "noteForm.editTitle": "Tadım Notunu Düzenle",
  "noteForm.backToWhiskey": "Viskiye Dön",
  "noteForm.backToTastings": "Tadımlarıma Dön",
  "noteForm.sessionCard": "Tadım Seansı",
  "noteForm.date": "Tadım Tarihi",
  "noteForm.rating": "Puan:",
  "noteForm.noseCard": "Burun (Nose)",
  "noteForm.nose": "Burun",
  "noteForm.noseNotes": "Burun Notlarınız",
  "noteForm.nosePlaceholder": "Bardağı burnunuza yaklaştırdığınızda ne hissediyorsunuz?",
  "noteForm.palateCard": "Damak (Palate)",
  "noteForm.palate": "Damak",
  "noteForm.palateNotes": "Damak Notlarınız",
  "noteForm.palatePlaceholder": "İlk yudumda hangi tatlar öne çıkıyor?",
  "noteForm.finishCard": "Bitiş (Finish)",
  "noteForm.finish": "Bitiş",
  "noteForm.finishLength": "Bitiş Uzunluğu",
  "noteForm.finishNotes": "Bitiş Notlarınız",
  "noteForm.finishPlaceholder": "Yudumdan sonra damakta ne kalıyor?",
  "noteForm.personalCard": "Kişisel Notlar",
  "noteForm.personalNotes": "Anılarınız ve Düşünceleriniz",
  "noteForm.personalPlaceholder": "Bu tadımı özel kılan neydi? Nerede, kiminle içtiniz?",
  "noteForm.visibility": "Görünürlük",
  "noteForm.visibilityPrivate": "Özel (yalnızca ben)",
  "noteForm.visibilityPublic": "Herkese açık",
  "noteForm.favorite": "Favori",
  "noteForm.cancel": "Vazgeç",
  "noteForm.save": "Tadım Notunu Kaydet",
  "noteForm.saveChanges": "Değişiklikleri Kaydet",
  "noteForm.failed": "Tadım notu kaydedilemedi",

  // --- Öneriler -----------------------------------------------------------
  "recommendations.title": "Öneriler",
  "recommendations.subtitle":
    "Tadım notlarınızdaki aroma tercihlerinize göre, henüz denemediğiniz viskiler.",
  "recommendations.empty": "Henüz size özel öneri oluşturamadık.",
  "recommendations.emptyHint":
    "Tadım notlarınızda aroma etiketi seçtikçe damak profiliniz oluşur ve öneriler burada görünür.",

  // --- Profil -------------------------------------------------------------
  "profile.title": "Profilim",
  "profile.memberSince": "{date} tarihinden beri üye",
  "profile.infoTitle": "Profil Bilgileri",
  "profile.infoDescription": "Adınızı, hakkınızda yazınızı ve profil fotoğrafınızı güncelleyin.",
  "profile.notFound": "Kullanıcı Bulunamadı",
  "profile.statTastings": "Tadım",
  "profile.statFollowers": "Takipçi",
  "profile.statFollowing": "Takip",
  "profile.edit": "Profili düzenle",
  "profile.publicTastings": "Herkese Açık Tadımlar",
  "profile.noPublicOwn": "Henüz herkese açık tadımınız yok.",
  "profile.noPublicOther": "Bu kullanıcının henüz herkese açık tadımı yok.",
  "profile.noPublicHint":
    "Tadım notlarınızı “Herkese açık” olarak işaretlerseniz burada görünür.",

  // --- İstek listesi ------------------------------------------------------
  "wishlist.title": "İstek Listem",
  "wishlist.count": "Denemeyi düşündüğünüz {count} viski.",
  "wishlist.subtitle": "Denemeyi düşündüğünüz viskileri burada toplayın.",
  "wishlist.empty": "İstek listeniz henüz boş.",
  "wishlist.emptyHint":
    "Katalogda denemek istediğiniz bir viski bulduğunuzda, detay sayfasından ekleyin.",

  // --- Favoriler ----------------------------------------------------------
  "favorites.title": "Favorilerim",
  "favorites.count": "{count} favori tadımınız var.",
  "favorites.subtitle": "Henüz favori tadımınız yok.",
  "favorites.empty": "Favori tadımlarınız burada görünecek.",
  "favorites.emptyHintBefore": "Tadımlarınızdan",
  "favorites.emptyHintAfter": "kalp simgesine tıklayarak favorilerinize ekleyin.",

  // --- Tadımlarım ---------------------------------------------------------
  "myTastings.title": "Tadımlarım",
  "myTastings.count": "Toplam {count} tadım seansı kaydettiniz.",
  "myTastings.subtitle": "Henüz tadım notunuz yok.",
  "myTastings.new": "Yeni Tadım",
  "myTastings.empty": "Günlüğünüz sizi bekliyor.",
  "myTastings.emptyHintBefore": "Katalogdan bir viski seçin",
  "myTastings.emptyHintAfter": "ve ilk tadım notunuzu yazın.",

  // --- Akış ---------------------------------------------------------------
  "feed.title": "Akış",
  "feed.subtitle": "Takip ettiğiniz kişilerin en yeni herkese açık tadımları.",
  "feed.empty": "Akışınız henüz boş.",
  "feed.emptyHint":
    "Diğer tutkunları takip ederek onların herkese açık tadımlarını burada görün.",
  "feed.discoverPeople": "Kişileri Keşfet",

  // --- Ana sayfa ----------------------------------------------------------
  "home.eyebrow": "Premium Viski Tadım Günlüğü",
  "home.headlineBefore": "Her yudum",
  "home.headlineHighlight": "bir hatıra",
  "home.headlineAfter": ", her şişe bir hikâye.",
  "home.subtitle":
    "CaskKeeper ile viskileri keşfedin, tadım deneyimlerinizi zarif bir günlükte saklayın ve damak zevkinizin yolculuğunu izleyin.",
  "home.ctaDashboard": "Panelime Git",
  "home.ctaCatalogue": "Kataloğa Göz At",
  "home.ctaSignUp": "Ücretsiz Başlayın",

  "home.feature.discover.title": "Keşfedin",
  "home.feature.discover.body":
    "Dünya viskilerinin yer aldığı merkezi katalogda markaya, bölgeye ve tipe göre arama yapın.",
  "home.feature.record.title": "Kaydedin",
  "home.feature.record.body":
    "Her tadım seansını burun, damak ve bitiş notlarıyla, aroma çarkından seçtiğiniz etiketlerle kaydedin.",
  "home.feature.compare.title": "Karşılaştırın",
  "home.feature.compare.body":
    "Aynı viskiye ait tadımlarınızı zaman içinde karşılaştırın, damak zevkinizin evrimini izleyin.",
  "home.feature.favorite.title": "Favorileyin",
  "home.feature.favorite.body":
    "En sevdiğiniz tadımları işaretleyin, kişisel viski hafızanızı oluşturun.",
  "people.publicNoteCount": "{count} herkese açık tadım",

  // --- Alan doğrulama -----------------------------------------------------
  // İstemci formları ile sunucu şemaları BU anahtarları paylaşır: aynı kural
  // iki yerde tanımlı olduğu için metin de iki yerde yazılıydı ve ayrışabilirdi.
  // İstemci t() ile, sunucu mk() ile aynı anahtara bağlanır.
  "validation.nameMin": "İsim en az 2 karakter olmalı",
  "validation.nameMax": "İsim en fazla 60 karakter olabilir",
  "validation.email": "Geçerli bir e-posta adresi giriniz",
  "validation.passwordMin": "Parola en az 8 karakter olmalı",
  "validation.passwordMax": "Parola en fazla 72 karakter olabilir",
  "validation.passwordRequired": "Parola zorunludur",
  "validation.passwordMismatch": "Parolalar eşleşmiyor",
  "validation.bioMax": "Hakkında yazısı en fazla 500 karakter olabilir",
  "validation.url": "Geçerli bir URL giriniz",
  "validation.brandMin": "Marka en az 2 karakter olmalı",
  "validation.whiskeyNameMin": "Ürün adı en az 2 karakter olmalı",
  "validation.distilleryRequired": "Damıtımevi zorunludur",
  "validation.typeRequired": "Tip zorunludur",
  "validation.regionRequired": "Bölge zorunludur",
  "validation.countryRequired": "Ülke zorunludur",
  "validation.abvRange": "0-100 arası olmalı",
  "validation.whiskeyIdInvalid": "Geçersiz viski kimliği",
  "validation.tastingDateRequired": "Tadım tarihi zorunludur",
  "validation.ratingNumber": "Puan sayı olmalı",
  "validation.ratingRange": "Puan 0-100 arası olmalı",
  "validation.noseNotesMax": "Burun notu en fazla 1000 karakter olabilir",
  "validation.palateNotesMax": "Damak notu en fazla 1000 karakter olabilir",
  "validation.finishNotesMax": "Bitiş notu en fazla 1000 karakter olabilir",
  "validation.finishLengthRequired": "Bitiş uzunluğu seçiniz",
  "validation.personalNotesMax": "Kişisel notlar en fazla 2000 karakter olabilir",
  "validation.commentRequired": "Yorum boş olamaz",
  "validation.commentMax": "Yorum en fazla 1000 karakter olabilir",

  // --- Sunucu hataları ----------------------------------------------------
  // Servis katmanı bu anahtarları FIRLATIR, metne çevirmez; çeviri isteğin
  // dilinde handleApiError'da yapılır (bkz. lib/errors.ts).
  "errors.generic": "Bir hata oluştu",
  "errors.unexpected": "Beklenmeyen bir hata oluştu",
  "errors.invalidData": "Geçersiz veri",
  "errors.notFound": "Kayıt bulunamadı",
  "errors.conflict": "Bu kayıt zaten mevcut",
  "errors.forbidden": "Bu işlem için yetkiniz yok",
  "errors.loginRequired": "Bu işlem için giriş yapmalısınız",
  "errors.adminRequired": "Bu işlem için yönetici yetkisi gerekli",
  "errors.tooManyAttempts": "Çok fazla deneme yapıldı. Lütfen biraz sonra tekrar deneyin.",

  "errors.invalidRegistration": "Geçersiz kayıt bilgileri",
  "errors.invalidLoginData": "Geçersiz giriş bilgileri",
  "errors.emailTaken": "Bu e-posta adresi ile kayıtlı bir hesap zaten var",
  "errors.invalidCredentials": "E-posta veya parola hatalı",

  "errors.userNotFound": "Kullanıcı bulunamadı",
  "errors.cannotFollowSelf": "Kendinizi takip edemezsiniz",
  "errors.cannotDemoteSelf": "Kendi yönetici yetkinizi kaldıramazsınız",
  "errors.cannotDemoteLastAdmin": "Sistemdeki son yöneticinin yetkisi kaldırılamaz",
  "errors.invalidProfile": "Geçersiz profil bilgileri",
  "errors.invalidRole": "Geçersiz rol",

  "errors.tastingNoteNotFound": "Tadım notu bulunamadı",
  "errors.tastingNoteForbidden": "Bu tadım notuna erişim yetkiniz yok",
  "errors.invalidTastingNote": "Geçersiz tadım notu",
  "errors.whiskeyNotInCatalogue": "Viski katalogda bulunamadı",

  "errors.invalidComment": "Geçersiz yorum",
  "errors.commentNotFound": "Yorum bulunamadı",
  "errors.commentDeleteForbidden": "Bu yorumu silme yetkiniz yok",
  "errors.notificationNotFound": "Bildirim bulunamadı",

  "errors.whiskeyNotFound": "Viski bulunamadı",
  "errors.whiskeyNotFoundSlug": "Viski bulunamadı: {slug}",
  "errors.whiskeyAlreadyExists": "Bu viski katalogda zaten mevcut (slug: {slug})",
  "errors.whiskeyConflict": "Bu bilgilerle başka bir viski zaten mevcut (slug: {slug})",
  "errors.invalidWhiskeyData": "Geçersiz viski verisi",
} as const;

export type TranslationKey = keyof typeof tr;
