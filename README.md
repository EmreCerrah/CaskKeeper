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

**Gelişmiş (Faz 3)**
- 📈 **Detaylı istatistikler** — zaman içinde aroma değişimi, tip/bölge/damıtımevi dağılımı
- ✨ **Öneri motoru** — damak profilinize göre henüz denemediğiniz viskiler
- 🔖 **İstek listesi** — denemeyi düşündüğünüz viskiler
- ⚖️ **Karşılaştırma** — en fazla 3 viski yan yana, ortak aroma notaları vurgulu

**Genel**
- 🌙 **Koyu, amber/altın temalı premium arayüz** — tamamen Türkçe
- 📱 **Mobil uyumlu** — alt sekme çubuğu, 44px dokunma hedefleri (WCAG 2.5.5)

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

## Hızlı Başlangıç

### Docker ile (tüm yığın tek komutta)

```bash
echo "JWT_SECRET=$(openssl rand -base64 48)" > .env
npm run docker:up
```

Uygulama <http://localhost:3000> adresinde. Compose, MongoDB'yi `127.0.0.1:27017`'ye
bağlar (yalnızca loopback), böylece katalog verisini host'tan yükleyebilirsiniz:

```bash
cp .env.example .env.local        # MONGODB_URI zaten localhost'u gösteriyor
npm run data:setup                # indeksleri kurar + 194 viskiyi yükler
```

Durdurmak için `npm run docker:down`.

### Docker'sız (yerel Node + kendi MongoDB'niz)

```bash
npm install
cp .env.example .env.local        # MONGODB_URI ve JWT_SECRET'ı doldurun
npm run data:setup                # indeksler + katalog verisi
npm run dev
```

## Komutlar

| Komut | Ne yapar |
|---|---|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Üretim derlemesi |
| `npm start` | Derlenmiş uygulamayı çalıştırır |
| `npm run lint` | ESLint |
| `npm test` | Testler (tek sefer) |
| `npm run test:watch` | Testler (izleme modu) |
| `npm run data:setup` | **İlk kurulum** — indeksleri kurar, sonra kataloğu yükler |
| `npm run data:seed` | Kataloğu yükler/günceller (idempotent, upsert) |
| `npm run data:reset` | Kataloğu **boşaltıp** yeniden yükler |
| `npm run db:indexes` | İndeksleri model tanımlarıyla eşitler |
| `npm run docker:up` | Docker yığınını başlatır (app + MongoDB) |
| `npm run docker:down` | Docker yığınını durdurur |

<details>
<summary>Import script'inin ek bayrakları</summary>

`data:seed` ve `data:reset` altında `scripts/import-whiskeys.ts` çalışır. Doğrudan
çağırarak ek bayrak verebilirsiniz:

```bash
npx tsx scripts/import-whiskeys.ts --dir=data --dry-run      # yazmadan prova
npx tsx scripts/import-whiskeys.ts --dir=data --insert-only  # mevcutları atla
npx tsx scripts/import-whiskeys.ts --file=data/whiskies-part-01.json
DEBUG=true npx tsx scripts/import-whiskeys.ts --dir=data     # ayrıntılı log
IMPORT_LOG_FILE=logs/import.log npx tsx scripts/import-whiskeys.ts --dir=data
```

> `data:reset` tadım notlarına **dokunmaz**, ama silinen viskilere işaret eden
> notlar öksüz referans taşır.

</details>

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
npm run db:indexes
```

Mongoose yeni indeksleri otomatik oluşturur ancak **şemadan kaldırılan
indeksleri düşürmez**; bu komut farkı kapatır.

## Üretime Alma (Vercel + MongoDB Atlas)

Üretim hedefi Vercel; Docker yerel geliştirme ve alternatif sunucular için durur.

### 1. Atlas kümesi

1. Bir küme oluşturun, **Database Access**'ten uygulama için ayrı bir kullanıcı
   açın (`readWrite`, yalnızca `caskkeeper` veritabanında).
2. **Network Access**: Vercel'in IP'leri sabit olmadığı için `0.0.0.0/0` gerekir.
   Erişim kontrolünü kimlik doğrulaması sağlar — bu yüzden parolanın güçlü
   olması kritik.
3. Bağlantı dizesini alın ve **veritabanı adını yola ekleyin**:
   `mongodb+srv://kullanici:parola@cluster.mongodb.net/caskkeeper?retryWrites=true&w=majority`
   Yol boş bırakılırsa Mongoose `test` veritabanına bağlanır.

### 2. Vercel ortam değişkenleri

Project Settings → Environment Variables:

| Değişken | Değer |
|---|---|
| `MONGODB_URI` | Atlas bağlantı dizesi (yukarıdaki) |
| `JWT_SECRET` | `openssl rand -base64 48` çıktısı — yerelde kullandığınızdan **farklı** olmalı |

### 3. İlk veri yüklemesi

Katalog verisi depoda (`data/`), uygulama açılışta kendiliğinden yüklemez.
Deploy sonrası bir kez, **yerelinizden Atlas'a** yükleyin:

```bash
MONGODB_URI="mongodb+srv://...caskkeeper?retryWrites=true&w=majority" npm run data:setup
```

Bu komut indeksleri kurar ve 194 viskiyi yükler. İdempotenttir — tekrar
çalıştırmak güvenlidir, mevcut kayıtları günceller.

### 4. İlk yönetici

İlk kaydolan kullanıcı otomatik olarak **admin** olur. Deploy'dan hemen sonra
kendi hesabınızı oluşturun.

### Bilinmesi gerekenler

- **Hız sınırlama yok.** `/api/auth/login` ve `/api/auth/register` sınırsız
  denemeye açık. Vercel sunucusuz olduğu için bellek içi sayaç işe yaramaz;
  kalıcı bir çözüm harici bir store (ör. Upstash Redis) gerektirir.
- **`JWT_SECRET` değişirse** tüm oturumlar geçersiz olur, kullanıcılar yeniden
  giriş yapar.
- **Yedekleme** Atlas'ın sorumluluğunda — küme planınızda yedeklemenin açık
  olduğunu doğrulayın.
- Güvenlik başlıkları (`X-Frame-Options`, `HSTS`, vb.) `next.config.mjs`'de
  tanımlı. **HSTS**, TLS olmayan bir ortamda siteyi erişilemez yapabilir;
  Vercel her zaman TLS sonlandırdığı için orada sorun değildir.

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
| GET | `/api/dashboard` | Tadım istatistikleri (panel özeti) | ✔ |
| GET | `/api/analytics` | Aroma trendi + katalog dağılımı | ✔ |
| GET | `/api/recommendations` | Damak profiline göre viski önerileri | ✔ |
| GET | `/api/wishlist` | İstek listesi | ✔ |
| POST/DELETE | `/api/wishlist/[whiskeyId]` | İstek listesine ekle / çıkar | ✔ |
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
- **Faz 3 — Gelişmiş:** ✅ tamamlandı — istatistik/aroma analitiği, öneri motoru, istek listesi, karşılaştırma
- **Sırada:** hız sınırlama, repository katmanı entegrasyon testleri, `next@16` yükseltmesi
