import { createResponse, handleApiError } from "@/lib/api-response";
import { AROMA_TAG_CATEGORIES } from "@/lib/constants/aroma-wheel";

/**
 * GET /api/aroma-wheel — tadım notlarında kullanılan aroma kategorileri.
 *
 * Neden bir uç: etiketler veritabanına OLDUĞU GİBİ metin olarak yazılıyor ve
 * istatistikler ile öneri motoru bu metinleri eşleştiriyor. Liste mobil tarafa
 * kopyalansaydı, web'de bir etiket değiştiğinde iki istemci farklı metin
 * üretmeye başlar ve bu sessizce yanlış istatistik olurdu. Tek kaynak olunca
 * kayma imkânsız.
 *
 * Yanıt yalnızca KAYABİLECEK veriyi taşır:
 * - `color` yok — Tailwind sınıf adı, yalnızca web'in işine yarıyor.
 * - `label` yok — kategori başlığı sunum, veri değil; istemci `category`
 *   kimliğinden kendi diline çeviriyor.
 * - `tags` aynen geçer — saklanan değer onlar, çevrilirse veri bozulur.
 *
 * Veritabanına gitmiyor (sabitten okuyor), bu yüzden connectToDatabase yok.
 */
export async function GET() {
  try {
    const categories = AROMA_TAG_CATEGORIES.map(({ category, tags }) => ({ category, tags }));
    return createResponse(categories);
  } catch (error) {
    return handleApiError(error);
  }
}
