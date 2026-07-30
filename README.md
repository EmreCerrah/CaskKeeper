# CaskKeeper 🥃

Premium viski tadım günlüğü ve viski kataloğu. Viskileri keşfedin, tadım deneyimlerinizi kaydedin, damak zevkinizin evrimini izleyin.

> CaskKeeper bir e-ticaret veya envanter uygulaması **değildir** — viski tutkunları için zarif bir tadım defteridir.

## Özellikler

**Tadım günlüğü (Faz 1)**
- 🔐 **Kimlik doğrulama** — JWT (httpOnly cookie) tabanlı kayıt/giriş
- 📖 **Global viski kataloğu** — arama, tip/bölge/ülke filtreleri, sayfalama (194 viski)
- 🥃 **Viski detay sayfası** — teknik özellikler, aroma profili, ödüller
- ✍️ **Tadım günlüğü** — burun/damak/bitiş notları, aroma çarkından etiket seçimi, 0-100 puanlama; aynı viskiye birden çok tadım seansı
- ⭐ **Favoriler** — en sevdiğiniz tadımları işaretleyin
- 📊 **Panel** — tadım istatistikleri ve damak profiliniz (en çok seçtiğiniz aromalar)
- 👤 **Profil** — isim, hakkımda, profil fotoğrafı

**Topluluk (Faz 2)**
- 🌐 **Herkese açık profiller** — takipçi/takip edilen sayısı, herkese açık tadımlar
- 👥 **Takip sistemi** — tek yönlü takip; karşılıklı takip "Arkadaş" rozetiyle gösterilir
- 🔍 **Kullanıcı arama & keşfet** — isimle arama, arama boşken yeni katılanlar
- 📰 **Aktivite akışı** (`/akis`) — takip edilen kişilerin herkese açık tadımları
- ❤️ **Beğeni** — herkese açık tadım notlarına, tek tık
- 💬 **Yorum** — herkese açık tadım notlarına; yorumu yazan ya da not sahibi silebilir
- 🔔 **Bildirimler** — takip/beğeni/yorum için, okundu/okunmadı durumu, gezinme çubuğunda zil

**Genel**
- 🌙 **Koyu, amber/altın temalı premium arayüz** — tamamen Türkçe

## Teknoloji

Next.js 14 (App Router) · React 18 · TypeScript · MongoDB + Mongoose · Zod · React Hook Form · Tailwind CSS · shadcn/ui deseni

## Mimari

```
API Route (ince katman, HTTP detayı)
   ↓
Service   (iş kuralları, Zod validasyon, sahiplik kontrolü)
   ↓
Repository (tüm MongoDB erişimi)
   ↓
Model     (Mongoose şemaları)
```

- İş mantığı asla route içinde yaşamaz.
- İstemciye yalnızca düz **DTO**'lar döner (`src/lib/types/dto.ts`) — Mongoose dokümanları UI'a sızmaz.
- Viski kataloğu **globaldir** ve import edilir; kullanıcılar yalnızca tüketir. Tadım notları kullanıcıya aittir.

## Docker ile Çalıştırma (önerilen)

```bash
# 1. JWT anahtarı üretin ve .env dosyasına yazın
echo "JWT_SECRET=$(openssl rand -base64 48)" > .env

# 2. Uygulamayı ve MongoDB'yi başlatın
docker compose up -d --build
```

Uygulama: http://localhost:3000 · Sağlık kontrolü: http://localhost:3000/api/health

> **Katalog verisi:** Import script'i geliştirme bağımlılıklarına ihtiyaç duyduğu
> için host'tan çalıştırılır. `data/` klasöründeki 16 parça dosyanın (194 viski)
> tamamını yükler:
> ```bash
> # compose, mongo'yu 127.0.0.1:27017'ye bağlar (yalnızca loopback)
> echo "MONGODB_URI=mongodb://localhost:27017/caskkeeper" > .env.local
> npm run seed:catalog
> ```
> Prova için `npm run seed:catalog:dry`; kataloğu boşaltıp yeniden yüklemek için
> `npm run seed:catalog:reset` (tadım notlarına dokunmaz, ama silinen viskilere
> işaret eden notlar öksüz kalır). Alternatif olarak `POST /api/whiskeys`
> endpoint'i ile tek tek eklenebilir.

## Yerel Geliştirme

```bash
# 1. Bağımlılıklar
npm install

# 2. Ortam değişkenleri
cp .env.example .env.local   # değerleri düzenleyin

# 3. MongoDB (Docker ile)
docker run -d -p 27017:27017 --name caskkeeper-dev-mongo mongo:7

# 4. Katalog verisi (data/ klasöründeki 16 parça, 194 viski)
npm run seed:catalog

# 5. Geliştirme sunucusu
npm run dev
```

## Test

```bash
npm test          # tüm testleri bir kez çalıştırır
npm run test:watch
```

Testler **Vitest** ile yazılır ve veritabanı gerektirmez — service katmanı,
repository'ler mock'lanarak izole edilir. Kapsanan kritik kurallar: tadım notu
sahipliği, rol korumaları, kimlik doğrulama, katalog kimliği (slug) mantığı,
beğeni/yorumun yalnızca herkese açık notlara verilebilmesi, yorum silme yetkisi
ve bildirimlerin yalnızca başkasının eylemi için üretilmesi (kendi notunu
beğenmek gibi durumlar bildirim doğurmaz).

## Veritabanı İndeksleri

Bir modelin indeks tanımı değiştiğinde, dağıtımdan sonra bir kez çalıştırın:

```bash
npm run db:sync-indexes
```

Mongoose yeni indeksleri otomatik oluşturur ancak **şemadan kaldırılan
indeksleri düşürmez**; bu komut farkı kapatır.

## API Endpoint'leri

| Metot | Yol | Açıklama | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Kayıt (otomatik giriş) | — |
| POST | `/api/auth/login` | Giriş | — |
| POST | `/api/auth/logout` | Çıkış | — |
| GET | `/api/auth/me` | Aktif kullanıcı | ✔ |
| GET | `/api/whiskeys` | Katalog (arama + filtre + sayfalama) | — |
| POST | `/api/whiskeys` | Viski ekle (import/admin amaçlı) | — |
| GET | `/api/whiskeys/[slug]` | Viski detayı | — |
| GET/POST | `/api/tasting-notes` | Tadım notlarım / yeni not | ✔ |
| GET/PATCH/DELETE | `/api/tasting-notes/[id]` | Not detay/güncelle/sil | ✔ |
| POST/DELETE | `/api/tasting-notes/[id]/like` | Beğen / beğeniyi kaldır (yalnızca herkese açık nota) | ✔ |
| GET/POST | `/api/tasting-notes/[id]/comments` | Yorumları listele / yorum ekle | GET —, POST ✔ |
| DELETE | `/api/comments/[id]` | Yorum sil (yazarı ya da not sahibi) | ✔ |
| PATCH | `/api/users/me` | Profil güncelle | ✔ |
| GET | `/api/users/search` | Kullanıcı arama / keşfet listesi | — |
| POST/DELETE | `/api/users/[id]/follow` | Takip et / takibi bırak | ✔ |
| GET | `/api/feed` | Aktivite akışı (takip edilenlerin herkese açık notları) | ✔ |
| GET | `/api/notifications` | Bildirim listesi + okunmamış sayısı | ✔ |
| POST | `/api/notifications/[id]/read` | Tek bildirimi okundu işaretle | ✔ |
| POST | `/api/notifications/read-all` | Tüm bildirimleri okundu işaretle | ✔ |
| GET | `/api/dashboard` | Tadım istatistikleri | ✔ |
| GET | `/api/admin/users` | Kullanıcı listesi (yönetim) | ✔ admin |
| PATCH | `/api/admin/users/[id]/role` | Kullanıcı rolü değiştir | ✔ admin |
| GET | `/api/health` | DB sağlık kontrolü | — |

## Ortam Değişkenleri

| Değişken | Açıklama |
|---|---|
| `MONGODB_URI` | MongoDB bağlantı adresi |
| `JWT_SECRET` | Oturum token imzalama anahtarı (üretimde güçlü olmalı) |

## Yol Haritası

Güncel durum, planlanan özellikler ve bilinen teknik borçlar için
**[ROADMAP.md](ROADMAP.md)** dosyasına bakın.

Özet:
- **Faz 1 — Temel uygulama:** ✅ tamamlandı
- **Faz 2 — Topluluk:** ✅ tamamlandı — profiller, takip, arama, akış, beğeni, yorum, bildirim
- **Faz 3 — Gelişmiş:** planlanıyor — istatistikler, öneri motoru, karşılaştırma, koleksiyon/istek listesi
