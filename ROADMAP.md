# CaskKeeper — Yol Haritası

Premium viski tadım günlüğü ve viski kataloğu. Bu belge projenin nereye gittiğini,
neyin tamamlandığını ve bilinen teknik borçları tek yerde tutar.

> Güncelleme kuralı: bir özellik `main`'e merge edildiğinde kutusunu işaretle ve
> ilgili PR numarasını yaz. Yeni teknik borç fark ettiğinde ilgili bölüme ekle.

**Son güncelleme:** 2026-07-29

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
| Faz 2 · Dilim 3 — Etkileşim | ⬜ Sıradaki | — |
| Faz 3 — Gelişmiş özellikler | ⬜ Planlanan | — |

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

### Dilim 3 — Etkileşim ⬜ (sıradaki)

- [ ] Tadım notlarına beğeni
- [ ] Tadım notlarına yorum
- [ ] Bildirimler (takip, beğeni, yorum)
- [ ] Bildirim okundu/okunmadı durumu

## Faz 3 — Gelişmiş Özellikler ⬜

- [ ] Detaylı istatistikler ve aroma analitiği
- [ ] Öneri motoru (damak profiline göre viski önerisi)
- [ ] Viski karşılaştırma
- [ ] Şişe koleksiyonu (sahip olunan şişeler)
- [ ] İstek listesi (wishlist)
- [ ] Tadım notlarını dışa/içe aktarma
- [ ] Mobil optimizasyon iyileştirmeleri

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

### 3. Import script mimariyi atlıyor — *orta*
`scripts/import-whiskeys.ts` doğrudan Mongoose modeline yazıyor; repository ve
service katmanlarını kullanmıyor. Validasyon/slug mantığı script içinde
tekrarlanıyor. Service üzerinden geçirilmesi tutarlılığı artırır.

### 4. Rol değişimi menüye gecikmeli yansıyor — *düşük*
Rol JWT içinde tutulduğundan, yetki değişikliği kullanıcının menüsüne bir
sonraki girişinde yansır. **Güvenlik etkisi yok** — yetki gerektiren tüm
işlemler rolü her istekte veritabanından doğrular (`lib/auth/admin.ts`).

### 5. Artık `whiskies` koleksiyonu — *düşük*
Geliştirme veritabanında, ham `sample-data.json` verisinin elle yüklendiği
`whiskies` koleksiyonu duruyor. Uygulama kullanmıyor; kafa karışıklığı yaratmasın
diye silinebilir: `db.whiskies.drop()`

### 6. `next/image` kullanılmıyor — *bilinçli tercih*
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
