# CaskKeeper — Yol Haritası

Premium viski tadım günlüğü ve viski kataloğu. Bu belge projenin nereye gittiğini,
neyin tamamlandığını ve bilinen teknik borçları tek yerde tutar.

> Güncelleme kuralı: bir özellik `main`'e merge edildiğinde kutusunu işaretle ve
> ilgili PR numarasını yaz. Yeni teknik borç fark ettiğinde ilgili bölüme ekle.

**Son güncelleme:** 2026-07-31 · **Durum:** tüm planlanan fazlar tamamlandı,
üretime alınmaya hazır (bkz. [Sırada Ne Var](#sırada-ne-var))

---

## Ürün Tanımı

CaskKeeper viski tutkunlarının **tadım deneyimlerini kaydettiği** bir günlüktür.

- ✅ Viski keşfi, tadım notu, damak zevkinin zaman içindeki değişimi, topluluk
- ❌ E-ticaret değil, envanter/stok yönetimi değil

**İki ayrı alan, asla karışmaz:**

| Alan | Sahibi | Kural |
|---|---|---|
| Viski kataloğu | Uygulama | Global, import edilir; kullanıcılar yalnızca tüketir, yöneticiler düzenler |
| Tadım notları | Kullanıcı | Kişiseldir; bir kullanıcı aynı viskiye birden çok not yazabilir (her biri bir seans) |

---

## Durum Özeti

| Aşama | Durum | PR |
|---|---|---|
| Ara iş — Test altyapısı & katalog kimliği | ✅ Tamamlandı | #7 |
| Faz 1 — Temel uygulama | ✅ Tamamlandı | #1 |
| Faz 2 · Dilim 1 — Sosyal katman | ✅ Tamamlandı | #2 |
| Ara iş — Admin & katalog yönetimi | ✅ Tamamlandı | #4 |
| Faz 2 · Dilim 2 — Kullanıcı arama & arkadaşlık | ✅ Tamamlandı | #5 |
| Faz 2 · Dilim 3 — Etkileşim | ✅ Tamamlandı | direkt merge* |
| Ara iş — Katalog verisi yenilendi (194 viski, 16 parça) | ✅ Tamamlandı | #9 |
| Faz 3 · Dilim A — İstatistik & aroma analitiği | ✅ Tamamlandı | #10 |
| Faz 3 · Dilim B — Öneri motoru | ✅ Tamamlandı | #11 |
| Faz 3 · Dilim C — İstek listesi | ✅ Tamamlandı | #12 |
| Faz 3 · Dilim D — Viski karşılaştırma + güvenlik yükseltmesi | ✅ Tamamlandı | #13 |
| Ara iş — Depo temizliği & tek compose dosyası | ✅ Tamamlandı | #14 |
| Mobil optimizasyon | ✅ Tamamlandı | #15 |
| Üretime alma hazırlığı (Vercel + Atlas) & README | ✅ Tamamlandı | #16 |

\* Dilim 3 için ayrı PR açılmadı; `feat/interactions` dalı yerelde `main`'e
fast-forward merge edildi ve hemen ardından katalog silme commit'iyle birlikte
push edildi.

---

## Faz 1 — Temel Uygulama ✅

- [x] Kimlik doğrulama (JWT + httpOnly cookie), kayıt/giriş/çıkış
- [x] Viski kataloğu: arama, tip/bölge/ülke filtreleri, sayfalama
- [x] Viski detay sayfası (teknik özellikler, aroma profili, ödüller)
- [x] Tadım notu CRUD — aroma çarkı, 0-100 puan, burun/damak/bitiş
- [x] Tadımlarım, Favoriler
- [x] Panel: tadım istatistikleri ve damak profili
- [x] Profil düzenleme
- [x] Türkçe arayüz, koyu amber/altın tema, responsive
- [x] Dockerfile + docker-compose (app + MongoDB)

## Faz 2 — Topluluk

### Dilim 1 — Sosyal katman ✅

- [x] Herkese açık profiller (`/kullanicilar/[id]`)
- [x] Herkese açık tadım notları (`visibility: public`)
- [x] Takip sistemi (tek yönlü)
- [x] Takipçi / takip edilen listeleri
- [x] Aktivite akışı (`/akis`)

### Dilim 2 — Kullanıcı arama & arkadaşlık ✅

- [x] Kullanıcı arama sayfası (`/kullanicilar`)
- [x] Keşfet listesi (arama boşken yeni katılanlar)
- [x] "Arkadaş" rozeti — karşılıklı takip
- [x] Toplu sorgularla N+1 önleme

> Karar: ayrı bir istek/kabul akışı **kurulmadı**. Arkadaşlık, var olan
> karşılıklı takipten türetiliyor — ikinci bir sosyal graf oluşmuyor.

### Dilim 3 — Etkileşim ✅

- [x] Tadım notlarına beğeni (yalnızca herkese açık notlara; kendi notunu
      beğenmek bildirim üretmez)
- [x] Tadım notlarına yorum (silme yetkisi: yorumun yazarı ya da notun sahibi)
- [x] Bildirimler (takip, beğeni, yorum) — `/bildirimler`, gezinme çubuğunda zil
- [x] Bildirim okundu/okunmadı durumu — tekli ve "tümünü okundu işaretle"
- [x] Tadım notu kalıcı bağlantısı (`/tadimlar/[id]`) — bildirimlerin hedefi
- [x] Geri alınan eylemde (takibi bırak, beğeniyi kaldır) ilgili bildirim silinir
- [x] Not silindiğinde beğeni/yorum/bildirimleri cascade temizlenir

## Faz 3 — Gelişmiş Özellikler ✅

Sıra: **A → B → C → D**. Her dilim ayrı dalda, ayrı PR (bkz. Çalışma Tarzı).

### Dilim A — İstatistik & aroma analitiği ✅

- [x] Zaman içinde damak zevki değişimi (aylık aroma trendi, yığılmış bar grafiği)
- [x] Bölge/tip/damıtımevi dağılım grafikleri
- [x] `/panel/istatistikler` sayfası, `GET /api/analytics`
- [x] Ek: parola alanlarına göster/gizle butonu (aynı PR'da küçük düzeltme)

### Dilim B — Öneri motoru ✅

- [x] Kullanıcının en çok seçtiği aroma etiketlerine göre viski önerisi (ranking)
- [x] `/panel/oneriler` sayfası, `GET /api/recommendations`
- [x] Kataloğun serbest metin İngilizce `flavorProfile` alanı ile kullanıcının
      Türkçe aroma çarkı etiketleri arasında köprü: her ikisi de aynı 9 aroma
      kategorisine eşlenir (`src/lib/constants/flavor-profile-map.ts`)
- [x] Zaten tadılan viskiler önerilerden hariç tutulur

### Dilim C — İstek listesi ✅

- [x] Kullanıcının denemeyi düşündüğü viskileri işaretlemesi (wishlist)
- [x] Kapsam yalnızca bu: miktar/fiyat/konum gibi envanter alanları **yok**
      (ürün brief'indeki "envanter/stok yönetimi değil" kuralına uyum için
      "şişe koleksiyonu" fikri kapsam dışı bırakıldı)
- [x] `/istek-listem` sayfası, `GET/POST/DELETE /api/wishlist`
- [x] Viski detay sayfasında ekle/kaldır butonu

### Dilim D — Viski karşılaştırma ✅

- [x] En fazla 3 viskiyi yan yana karşılaştırma (teknik özellik + aroma profili)
- [x] Yeni kalıcı model gerekmedi — durum URL'de (`/karsilastir?viski=…`),
      paylaşılabilir ve geri tuşu uyumlu
- [x] Ortak aroma notaları vurgulanır (kesişim); ayrım renge değil, rozetteki
      "ortak" ibaresine de dayanır
- [x] Arama ile ekleme, tek tıkla çıkarma; giriş noktaları katalog ve viski
      detay sayfasında

> Kapsam dışı (şimdilik): tadım notu dışa/içe aktarma.

## Mobil Optimizasyon ✅ (PR #15)

- [x] Alt sekme çubuğu — masaüstü nav mobilde gizli olduğu için `/panel` ve
      `/istek-listem` erişilemiyordu; oturumsuz kullanıcının ise hiç bağlantısı yoktu
- [x] Dokunma hedefleri 44px'e çıkarıldı (WCAG 2.5.5), yalnızca mobilde —
      masaüstü ölçüleri `md:` ile korundu
- [x] Karşılaştırma tablosunda satır başlıkları sabitlendi
- [x] 320px'de yatay taşmalar giderildi (üst çubuk; panelde grid `min-width: auto`)

## Üretime Alma ✅

Hedef: **Vercel + MongoDB Atlas**. Docker yerel geliştirme ve alternatif
sunucular için korunuyor.

- [x] `output: "standalone"` yalnızca Docker build'inde (`DOCKER_BUILD=1`)
- [x] Güvenlik başlıkları: `X-Frame-Options`, `X-Content-Type-Options`,
      `Referrer-Policy`, `Permissions-Policy`, `HSTS`
- [x] `data:setup` — ilk kurulum için tek komut (indeksler + katalog)
- [x] `.env.example` Atlas/Vercel için belgelendi
- [x] README'ye "Üretime Alma" bölümü

> Kapsam dışı bırakıldı: **hız sınırlama**. Vercel sunucusuz olduğu için bellek
> içi sayaç işe yaramaz; kalıcı çözüm harici bir store (Upstash Redis vb.)
> gerektirir ve bu, sabit stack'e yeni bir bağımlılık eklemek demektir. Karar
> bilinçli olarak ertelendi — bkz. teknik borç.

---

## Sırada Ne Var

Planlanan tüm fazlar bitti. Kalan iş, yeni özellik değil — canlıya çıkmadan ya da
çıktıktan hemen sonra kapatılması gereken maddeler. Öncelik sırasıyla:

| # | İş | Neden | Büyüklük |
|---|---|---|---|
| 1 | Auth uçlarına hız sınırlama | Parola deneme saldırısına karşı koruma yok | Küçük, ama yeni bağımlılık kararı gerektirir |
| 2 | `next@16` yükseltmesi | Kalan HIGH uyarılar yalnızca burada kapanıyor | Büyük — async API geçişi, kendi dilimi |
| 3 | Repository entegrasyon testleri | Sorguların kendisi test kapsamı dışında | Orta |
| 4 | `db.ts` build'de zorunlu env istiyor | `next build` veritabanı adresi olmadan çalışmıyor | Çok küçük |

Detaylar aşağıdaki teknik borç bölümünde.

---

## Teknik Borç ve Bilinen Konular

### Açık maddeler

#### 1. Kimlik doğrulama uçlarında hız sınırlama yok — *yüksek*
`/api/auth/login` ve `/api/auth/register` sınırsız denemeye açık; parola deneme
saldırısına karşı koruma yok. Vercel'de bellek içi sayaç işe yaramaz (her istek
farklı bir sunucusuz örneğe düşebilir), bu yüzden harici bir store gerekiyor
(Upstash Redis, Vercel KV vb.). **Sabit stack'e yeni bağımlılık eklemek demek
olduğu için karar bilinçli olarak kullanıcıya bırakıldı.**

#### 2. `next@14` kalan güvenlik uyarıları — *orta, sınırlı etki*
`npm audit` hâlâ `next` ve Next'in kendi içinde taşıdığı `postcss@8.4.31` için
HIGH gösteriyor; ikisinin de tek düzeltmesi **`next@16` (semver-major)**.

Kalan uyarıların çoğu bu uygulamada **karşılığı olmayan** özellikleri hedefliyor
(kod tabanında tek tek doğrulandı):

| Uyarı grubu | Bu projede |
|---|---|
| Server Actions CVE'leri | `"use server"` hiç kullanılmıyor |
| `next/image` / Image Optimizer | `next/image` kullanılmıyor (bkz. madde 6) |
| rewrites SSRF / request smuggling | `next.config.mjs`'de rewrites yok |
| Pages Router + i18n middleware bypass | App Router, i18n yok |
| CSP nonce / `beforeInteractive` XSS | İkisi de kullanılmıyor |

Gerçekten geçerli olabilecekler RSC kaynaklı DoS/cache poisoning maddeleri; tüm
sayfalar `force-dynamic` olduğu için cache yüzeyi dar. Next'in içindeki `postcss`
ise yalnızca **derleme zamanı** çalışır ve CSS girdisi depodan gelir, kullanıcıdan
değil.

> Next 14 → 16 geçişi `cookies()`/`headers()`/`params`/`searchParams`'ı async
> yapar; `lib/auth/session.ts` ve neredeyse tüm sayfalar etkilenir. Kendi dilimi
> olarak planlanmalı.

#### 3. Repository katmanı entegrasyon testleri yok — *orta*
Testlerde repository'ler mock'lanıyor, yani sorguların kendisi (filtreler,
aggregate'ler, populate) kapsam dışında. `mongodb-memory-server` ile gerçek
sorgulara karşı test yazılması gerekiyor.

#### 4. `db.ts` modül yüklenirken env istiyor — *düşük*
`src/lib/db.ts` `MONGODB_URI` yoksa **modül seviyesinde** `throw` ediyor. Sonuç:
`next build` veritabanı adresi olmadan hiç çalışmıyor. Dockerfile'daki
`MONGODB_URI="mongodb://placeholder..."` satırı yalnızca bunu aşmak için var.
Kontrolü `connectToDatabase()` içine almak yeterli — build env gerektirmez,
çalışma zamanında yine net hata verir.

#### 5. Import script mimariyi atlıyor — *düşük*
`scripts/import-whiskeys.ts` doğrudan Mongoose modeline yazıyor; repository ve
service katmanlarını kullanmıyor. Validasyon/slug mantığı script içinde
tekrarlanıyor. Bilinçli olarak düşük öncelikli: katalog bir kez seed edildikten
sonra bu script canlı uygulama akışının parçası değil, yalnızca ihtiyaç halinde
çalıştırılan bir bakım aracı.

#### 6. Rol değişimi menüye gecikmeli yansıyor — *düşük*
Rol JWT içinde tutulduğundan, yetki değişikliği kullanıcının menüsüne bir sonraki
girişinde yansır. **Güvenlik etkisi yok** — yetki gerektiren tüm işlemler rolü her
istekte veritabanından doğrular (`lib/auth/admin.ts`).

#### 7. `next/image` kullanılmıyor — *bilinçli tercih, kapatılmayacak*
Viski görselleri düz `<img>` ile yükleniyor. Sebep: katalog verisi dış
kaynaklardan geldiği için her yeni domain'i `next.config.mjs`'e eklemek
sürdürülebilir değil. `WhiskeyImage` bileşeni kırık/eksik görselleri fallback ile
karşılıyor.

### Çözülenler

<details>
<summary>Kapatılmış teknik borç maddeleri</summary>

#### ~~Test altyapısı yok~~ ✅ *PR #7*
Vitest kuruldu; service katmanı ve saf yardımcılar test ediliyor. Kapsanan kritik
kurallar: tadım notu sahipliği, rol korumaları (kendi yetkisini kaldırma / son
yönetici), ilk kullanıcının admin olması, parola hash'leme, katalog kimliği ve
slug yeniden üretimi. Sonradan eklendi: etkileşim görünürlük kuralları, öneri
skorlaması, karşılaştırma URL ayrıştırma. **135 test.**

#### ~~Katalog kimlik indeksleri tutarsız~~ ✅ *PR #7*
`distillery` zorunlu hale getirildi ve unique indeks `{brand, name, distillery}`
olarak güncellendi — slug'ın türetildiği üçlüyle birebir aynı. Bağımsız
şişelemeler (aynı marka+ürün adı, farklı damıtımevi) artık eklenebiliyor.

> İndeks tanımı değişirse dağıtımdan sonra bir kez `npm run db:indexes`
> çalıştırılmalı — Mongoose kaldırılan indeksleri kendiliğinden düşürmez.

#### ~~Kritik bağımlılık açıkları~~ ✅ *PR #13*
`next` 14.2.1 → **14.2.35**, `mongoose` → **8.24.2**, `postcss` → **8.5.25**.
**Critical seviye sıfırlandı** — en önemlisi, route korumasının tamamen
`middleware.ts`'e dayandığı bu uygulamayı doğrudan ilgilendiren *middleware yetki
atlatma* CVE'si kapandı. Yükseltme semver-major değil. Kalan artık risk için
bkz. açık madde 2.

> Not: `next@14.2.35` derlemede `jose`'nin JWE deflate yolu için "Edge Runtime'da
> desteklenmeyen Node.js API" uyarısı veriyor. Zararsız — uygulama yalnızca JWS
> (`SignJWT`/`jwtVerify`) kullanıyor, o kod yolu hiç çalışmıyor; middleware ve
> oturum akışı yükseltme sonrası uçtan uca doğrulandı.

#### ~~Artık `whiskies` koleksiyonu~~ ✅ *2026-07-30*
Geliştirme veritabanındaki eski ham `whiskies` koleksiyonu silindi. Katalog artık
yalnızca `whiskeys` koleksiyonunda, `data/` klasöründeki 16 parçadan
(`npm run data:seed`) besleniyor.

#### ~~Depo hijyeni~~ ✅ *PR #14*
11 MB'lık başıboş ikili dosya silindi; `.env.local` ve `.idea/workspace.xml`
takipten çıkarıldı (gitignore'da görünüp takipli olan tuzak); `zustand` ve ölü
aroma sabitleri kaldırıldı; iki compose dosyası teke indirildi.

</details>

---

## Mimari Kurallar

Yeni özellik eklerken bunlara uy:

```
API Route   → ince; yalnızca HTTP detayı (istek/yanıt, oturum)
   ↓
Service     → iş kuralları, Zod validasyonu, sahiplik/yetki kontrolü
   ↓
Repository  → tüm MongoDB erişimi
   ↓
Model       → Mongoose şemaları
```

- İş mantığı **asla** route içinde yaşamaz.
- Veritabanı erişimi **yalnızca** repository katmanında.
- İstemciye her zaman düz **DTO** döner (`src/lib/types/dto.ts`); Mongoose
  dokümanları UI'a sızmaz. Bu ayrım ileride Java Spring Boot backend'e geçişi
  kolaylaştırmak içindir.
- Validasyon **Zod** ile; hata sınıfları `src/lib/errors.ts`, route'larda
  `handleApiError` ile tutarlı yanıt.
- **Arayüz metinleri Türkçe**; kod, değişken ve dosya adları İngilizce.
  Dokümantasyon (`README.md`) İngilizce — arayüz kullanıcıya, doküman katkıcıya
  hitap eder. Bu belge (`ROADMAP.md`) proje içi planlama olduğu için Türkçe.
- Liste ekranlarında **N+1 sorgudan kaçın** — ilişkileri toplu çek.
- Mobilde dokunma hedefleri **en az 44px** (WCAG 2.5.5); masaüstü ölçüleri `md:`
  ile korunur. Bilgi **yalnızca renkle** aktarılmaz.

### Stack (sabit)

Next.js (App Router) · React · TypeScript · MongoDB + Mongoose · Zod ·
React Hook Form · Tailwind CSS · shadcn/ui deseni

Gereksiz yeni teknoloji eklenmez. Grafikler bile bu yüzden düz CSS/HTML ile
yazıldı — grafik kütüphanesi eklenmedi.

### Çalışma tarzı

- İş **dilimlere** bölünür; her dilim ayrı dalda, ayrı PR. Dallar `main`'den
  açılır, birbirine stack'lenmez.
- Commit öncesi `npm test` ve `npm run build`; mümkünse Docker'da ayağa kaldırıp
  canlı doğrulama. Sonuç **çıktıyla** raporlanır.
- Merge'ü proje sahibi yapar.

---

## İlgili Belgeler

- **[README.md](README.md)** — proje tanıtımı, kurulum, API referansı, dağıtım
- **`.env.example`** — ortam değişkenleri ve Atlas/Vercel notları
