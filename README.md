# CaskKeeper 🥃

Premium viski tadım günlüğü ve viski kataloğu. Viskileri keşfedin, tadım deneyimlerinizi kaydedin, damak zevkinizin evrimini izleyin.

> CaskKeeper bir e-ticaret veya envanter uygulaması **değildir** — viski tutkunları için zarif bir tadım defteridir.

## Özellikler (Faz 1)

- 🔐 **Kimlik doğrulama** — JWT (httpOnly cookie) tabanlı kayıt/giriş
- 📖 **Global viski kataloğu** — arama, tip/bölge/ülke filtreleri, sayfalama
- 🥃 **Viski detay sayfası** — teknik özellikler, aroma profili, ödüller
- ✍️ **Tadım günlüğü** — burun/damak/bitiş notları, aroma çarkından etiket seçimi, 0-100 puanlama; aynı viskiye birden çok tadım seansı
- ⭐ **Favoriler** — en sevdiğiniz tadımları işaretleyin
- 📊 **Panel** — tadım istatistikleri ve damak profiliniz (en çok seçtiğiniz aromalar)
- 👤 **Profil** — isim, hakkımda, profil fotoğrafı
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

# 3. Örnek viski verisini yükleyin (opsiyonel)
docker compose exec app sh -c 'echo "İçe aktarma host tarafından yapılır"'
```

Uygulama: http://localhost:3000 · Sağlık kontrolü: http://localhost:3000/api/health

> **Veri yükleme:** Import script'i geliştirme bağımlılıklarına ihtiyaç duyduğu için host'tan çalıştırılır:
> ```bash
> MONGODB_URI=mongodb://localhost:27017/caskkeeper # compose mongo portunu açmanız gerekir
> npm run seed:whiskeys:file
> ```
> Alternatif olarak `POST /api/whiskeys` endpoint'i ile tek tek eklenebilir.

## Yerel Geliştirme

```bash
# 1. Bağımlılıklar
npm install

# 2. Ortam değişkenleri
cp .env.example .env.local   # değerleri düzenleyin

# 3. MongoDB (Docker ile)
docker run -d -p 27017:27017 --name caskkeeper-dev-mongo mongo:7

# 4. Örnek veri
npm run seed:whiskeys:file

# 5. Geliştirme sunucusu
npm run dev
```

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
| PATCH | `/api/users/me` | Profil güncelle | ✔ |
| GET | `/api/dashboard` | Tadım istatistikleri | ✔ |
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
- **Faz 2 — Topluluk:** profiller, takip, akış ve kullanıcı arama tamam; beğeni/yorum/bildirim sırada
- **Faz 3 — Gelişmiş:** istatistikler, öneri motoru, karşılaştırma, koleksiyon/istek listesi
