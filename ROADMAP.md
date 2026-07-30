# CaskKeeper — Yol Haritası

Premium viski tadım günlüğü ve viski kataloğu. Bu belge projenin nereye gittiğini,
neyin tamamlandığını ve bilinen teknik borçları tek yerde tutar.

> Güncelleme kuralı: bir özellik `main`'e merge edildiğinde kutusunu işaretle ve
> ilgili PR numarasını yaz. Yeni teknik borç fark ettiğinde ilgili bölüme ekle.

**Son güncelleme:** 2026-07-30

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
| Faz 3 · Dilim A — İstatistik & aroma analitiği | ⬜ Sıradaki | — |
| Faz 3 · Dilim B — Öneri motoru | ⬜ Planlanan | — |
| Faz 3 · Dilim C — İstek listesi | ⬜ Planlanan | — |
| Faz 3 · Dilim D — Viski karşılaştırma | ⬜ Planlanan | — |
| Mobil optimizasyon (ayrı takip) | ⬜ Planlanan | — |

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

## Faz 3 — Gelişmiş Özellikler ⬜

Sıra: **A → B → C → D**. Her dilim ayrı dalda, ayrı PR (bkz. Çalışma Tarzı).

### Dilim A — İstatistik & aroma analitiği ⬜ (sıradaki)

- [ ] Zaman içinde damak zevki değişimi (aylık/dönemsel aroma eğilimi)
- [ ] Bölge/tip/damıtımevi dağılım grafikleri
- [ ] Mevcut `getStatsByUser` aggregate'inin genişletilmesi

### Dilim B — Öneri motoru ⬜

- [ ] Kullanıcının en çok seçtiği aroma etiketlerine göre viski önerisi (ranking)
- [ ] Dilim A'nın üstüne kurulur — aroma profili verisini kullanır

### Dilim C — İstek listesi ⬜

- [ ] Kullanıcının denemeyi düşündüğü viskileri işaretlemesi (wishlist)
- [ ] Kapsam yalnızca bu: miktar/fiyat/konum gibi envanter alanları **yok**
      (ürün brief'indeki "envanter/stok yönetimi değil" kuralına uyum için
      "şişe koleksiyonu" fikri kapsam dışı bırakıldı)

### Dilim D — Viski karşılaştırma ⬜

- [ ] En fazla 3 viskiyi yan yana karşılaştırma (teknik özellik + aroma profili)
- [ ] Yeni kalıcı model gerekmiyor, büyük ölçüde frontend

> Kapsam dışı (şimdilik): tadım notu dışa/içe aktarma.

## Mobil Optimizasyon ⬜ (ayrı takip)

Kesitsel bir iş — her sayfaya dokunduğu için Faz 3 dilimlerinden bağımsız,
kendi başına ele alınacak. Henüz dilimlenmedi.

---

## Teknik Borç ve Bilinen Konular

Öncelik sırasına göre:

### ~~1. Test altyapısı yok~~ ✅ *çözüldü (PR #7)*
Vitest kuruldu; service katmanı ve normalizasyon yardımcıları test ediliyor.
Kapsanan kritik kurallar: tadım notu sahipliği, rol korumaları (kendi yetkisini
kaldırma / son yönetici), ilk kullanıcının admin olması, parola hash'leme,
katalog kimliği ve slug yeniden üretimi.
`npm test` · `npm run test:watch`

> Kalan iş: repository katmanı için `mongodb-memory-server` ile entegrasyon
> testleri. Şu an repository'ler mock'lanıyor, yani sorguların kendisi
> (filtreler, aggregate'ler, populate) test kapsamı dışında.

### ~~2. Katalog kimlik indeksleri tutarsız~~ ✅ *çözüldü (PR #7)*
`distillery` zorunlu hale getirildi ve unique indeks `{brand, name, distillery}`
olarak güncellendi — slug'ın türetildiği üçlüyle birebir aynı. Bağımsız
şişelemeler (aynı marka+ürün adı, farklı damıtımevi) artık eklenebiliyor.

> İndeks tanımı değişirse dağıtımdan sonra bir kez `npm run db:sync-indexes`
> çalıştırılmalı — Mongoose kaldırılan indeksleri kendiliğinden düşürmez.

### 3. `next@14.2.1` bilinen güvenlik açıklarına sahip — *yüksek*
`npm audit`: 1 critical (Next.js — middleware yetki atlatma, SSRF, cache
poisoning dahil onlarca CVE), 1 high (postcss), 1 moderate (mongoose), 1 low
(esbuild). Bu uygulama route korumasını tamamen `middleware.ts`'e dayandırdığı
için middleware yetki atlatma CVE'si özellikle ilgili. Next.js'i güncel bir
14.x patch'ine (ya da 15'e) yükseltmek gerekiyor; kapsam ve regresyon riski
ayrı bir dilim olarak ele alınmalı.

### ~~4. Artık `whiskies` koleksiyonu~~ ✅ *çözüldü (2026-07-30)*
Geliştirme veritabanındaki eski ham `whiskies` koleksiyonu silindi. Katalog
artık yalnızca `whiskeys` koleksiyonunda, `data/` klasöründeki 16 parçadan
(`npm run seed:catalog`) besleniyor.

### 5. Import script mimariyi atlıyor — *düşük öncelik*
`scripts/import-whiskeys.ts` doğrudan Mongoose modeline yazıyor; repository ve
service katmanlarını kullanmıyor. Validasyon/slug mantığı script içinde
tekrarlanıyor. Bilinçli olarak düşük öncelikli tutuluyor: katalog bir kez
seed edildikten sonra bu script canlı uygulama akışının parçası olmayan,
yalnızca ihtiyaç halinde çalıştırılan bir bakım aracı.

### 6. Rol değişimi menüye gecikmeli yansıyor — *düşük*
Rol JWT içinde tutulduğundan, yetki değişikliği kullanıcının menüsüne bir
sonraki girişinde yansır. **Güvenlik etkisi yok** — yetki gerektiren tüm
işlemler rolü her istekte veritabanından doğrular (`lib/auth/admin.ts`).

### 7. `next/image` kullanılmıyor — *bilinçli tercih*
Viski görselleri düz `<img>` ile yükleniyor. Sebep: katalog verisi dış
kaynaklardan geldiği için her yeni domain'i `next.config.mjs`'e eklemek
sürdürülebilir değil. `WhiskeyImage` bileşeni kırık/eksik görselleri fallback ile
karşılıyor.

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
- Arayüz metinleri **Türkçe**; kod, değişken ve dosya adları İngilizce.
- Liste ekranlarında **N+1 sorgudan kaçın** — ilişkileri toplu çek.

### Stack (sabit)

Next.js (App Router) · React · TypeScript · MongoDB + Mongoose · Zod ·
React Hook Form · Tailwind CSS · shadcn/ui deseni · Zustand

Gereksiz yeni teknoloji eklenmez.
