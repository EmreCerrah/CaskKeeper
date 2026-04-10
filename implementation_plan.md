# CaskKeeper - Whiskey Tasting App MVP Plan

Bu doküman, DramLog benzeri CaskKeeper uygulamasının mimarisini ve ilk faz MVP (Minimum Viable Product) geliştirme adımlarını içermektedir. İkinci fazda projenin Java backend'e kolaylıkla taşınabilmesi için, klasik "N-Tier (Çok Katmanlı)" mimari prensipleri Next.js üzerinde uygulanacaktır.

## Hedeflenen Mimari: Domain-Driven (N-Tier) Yapı

Next.js API route'larının içine tüm logic'i yığmaktan kaçınmak için klasör yapısını backend ve frontend olarak net bir şekilde ayıracağız:

```text
src/
├── app/                  # Next.js App Router (Frontend Pages & API Controllers)
│   ├── (main)/           # Frontend Sayfaları (Dashboard, Ekleme vb.)
│   └── api/              # API Route'ları (Sadece Controller görevi görecek)
├── components/           # Reusable UI componentleri (shadcn/ui, vb.)
├── lib/                  # Utility fonksiyonları, veritabanı bağlantısı, vs.
├── store/                # Zustand state yönetimi
└── server/               # 🚀 BACKEND DOMAIN (İleride Java'ya taşınacak kısım)
    ├── models/           # Mongoose şemaları ve TS interfaceleri
    ├── repositories/     # Veritabanı sorguları (Data Access Layer)
    ├── services/         # Business Logic (İş kuralları)
    └── validations/      # Zod şemaları (DTO - Request/Response validasyonu)
```

Bu yapı sayesinde `app/api` klasöründeki kodlar sadece `server/services` içindeki metodları çağıracak. İleride Java geliştirildiğinde, sadece frontend'in API istek attığı URL'yi Java sunucusuna çevirmek yeterli olacaktır.

## User Review Required

> [!IMPORTANT]
> - **Authentication**: İlk fazda kullanıcı girişi (Login/Register) eklensin mi? Yoksa şimdilik tek bir test kullanıcısı (veya auth olmadan) üzerinden mi ilerleyelim? İleride NextAuth eklenebilir.
> - **Tasting Note Alanları**: Bir tadım notunda hangi alanlar olmalı? (Örn: Burun, Damak, Bitiş, Renk, Puan 1-100, Genel Yorum) Bu alanlar MVP için uygun mu?
> - **Varlıklar (Entities)**: Whiskey tablosu ile Tasting (Tadım) tablosunu ayıracağız. Yani önce viski veritabanında olacak, sonra o viskiye tadım eklenecek. Doğru mu?

## Proposed Changes

### 1. Proje Kurulumu ve Konfigürasyon
- `npx create-next-app` ile Next.js projesi oluşturulacak (TypeScript, Tailwind, App Router).
- `shadcn/ui` kurulacak.
- `mongoose`, `zod`, `zustand`, `react-hook-form` eklenecek.
- Standart Response yapısı oluşturulacak: `ApiResponse<T> { success: boolean, data?: T, error?: string }`

### 2. Backend Geliştirme (Server Katmanı)

#### Modeller (Models)
- `Whiskey`: Kategori, Marka, İsim, Alkol Oranı (ABV), Yaş, Bölge.
- `TastingNote`: Whiskey ID, Burun (Nose), Damak (Palate), Bitiş (Finish), Skor (Score), Notlar.

#### Database İşlemleri (Repositories)
- `WhiskeyRepository`: Viski bulma, ekleme, listeleme.
- `TastingRepository`: Tadım notu ekleme, listeleme.

#### İş Mantığı (Services)
- `WhiskeyService`: Validasyonları geçtikten sonra logici işleyip Repository'e gönderir.

#### Validasyonlar (Zod DTOs)
- Gelen HTTP isteklerini zorunlu alanlara göre (Zod ile) kontrol edeceğiz.

### 3. API Route Geliştirme (Controllers)
- `GET /api/whiskeys`
- `POST /api/whiskeys`
- `POST /api/tastings`

### 4. Frontend Geliştirme (UI Katmanı)
- **Ana Sayfa / Dashboard**: Son tadılan viskilerin ve istatistiklerin listesi.
- **Viski & Tadım Ekleme Formu**: `react-hook-form` ve `zod` entegreli hızlı kayıt formu.
- **Zustand Store**: Verileri cache'lemek ve UI tarafında hızlıca göstermek için.

## Open Questions

> [!WARNING]
> Proje başlangıcında terminal komutu `npx create-next-app@latest .` çalıştırarak başlamamı onaylıyor musunuz? Ve yukarıdaki mimari plan sizin için uygun mu? Mevcut bir veritabanı URL'niz (MongoDB) var mı yoksa `.env.local` içinde placeholder bir URL ile mi hazırlamamı istersiniz?

## Verification Plan
1. Proje bağımlılıkları yüklendiğinde lokal sunucu başlatılır (`npm run dev`).
2. MongoDB bağlantısının başarılı olduğu test edilir.
3. Postman / Browser üzerinden örnek bir Viski Ekleme API isteği çalıştırılır.
4. Başarılı kaydedildiği ve Listeleme sayfasında düzgün render edildiği görülür.
