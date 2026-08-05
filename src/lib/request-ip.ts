import type { NextRequest } from "next/server";

/**
 * @file request-ip.ts
 * @description İstemci IP'sini isteğin başlıklarından çıkarır.
 *
 * Uygulama Vercel'in (ya da Docker kurulumunda bir ters vekilin) arkasında
 * çalışıyor, bu yüzden bağlantının kendi adresi hep vekile ait. Gerçek istemci
 * `x-forwarded-for` listesinin BAŞINDA durur.
 *
 * GÜVENLİK: bu başlık istemci tarafından uydurulabilir. Vercel gelen isteğin
 * başlığını kendi değeriyle değiştirdiği için orada güvenilir; ters vekilsiz
 * doğrudan internete açılan bir kurulumda ise sahtelenebilir. Sonuç: hız
 * sınırlaması vekil arkasında sağlam, vekilsiz kurulumda atlatılabilir — bu
 * durum README'de yazılı.
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  // Vercel bunu ayrıca gönderir; bazı vekiller yalnızca bunu ayarlar.
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  // Adres hiç çözülemezse tüm bu istekler tek bir kovada toplanır. Sınırlamanın
  // tamamen devre dışı kalmasındansa bu daha güvenli.
  return "unknown";
}
