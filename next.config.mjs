/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone çıktı yalnızca Docker imajı için gerekli (minimal runtime).
  // Vercel kendi build çıktısını ürettiği için orada gereksiz — Dockerfile
  // DOCKER_BUILD=1 geçer, Vercel geçmez.
  ...(process.env.DOCKER_BUILD === "1" ? { output: "standalone" } : {}),

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Sayfanın başka sitede iframe'e gömülmesini engeller (clickjacking)
          { key: "X-Frame-Options", value: "DENY" },
          // Tarayıcının Content-Type tahmin etmesini kapatır
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Dış sitelere yalnızca origin sızar, tam URL değil
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Kullanılmayan güçlü tarayıcı API'lerini kapat
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // HTTPS'i zorunlu kılar. Vercel her zaman TLS sonlandırır.
          // DİKKAT: TLS'siz kendi sunucunuzda çalıştırırsanız bu başlık
          // tarayıcıyı HTTPS'e zorlar ve site erişilemez hale gelebilir.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
        ],
      },
      {
        // Service worker dosyası önbellekten sunulursa yeni sürüm kullanıcıya
        // günlerce ulaşmaz. Her zaman sunucuya doğrulatılır.
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "no-cache, must-revalidate" }],
      },
    ];
  },
};

export default nextConfig;
