import { NextRequest } from "next/server";
import { createResponse, handleApiError } from "@/lib/api-response";
import connectToDatabase from "@/lib/db";
import { whiskeyService } from "@/server/services/WhiskeyService";
import { parseCompareSlugs } from "@/lib/utils/comparison";

export const dynamic = "force-dynamic";

/**
 * GET /api/whiskeys/compare?slug=a&slug=b — karşılaştırma için viskiler.
 *
 * İstenen SIRA korunur (servis öyle davranıyor), bulunamayan slug sessizce
 * atlanır. Girdi güvenilmez: yinelenenleri atma ve üç öğe sınırı
 * parseCompareSlugs'ta zaten çözülmüş, aynı koruma burada yeniden kullanılıyor.
 *
 * Sorgu parametresi web'deki `viski` değil `slug`: sayfa URL'leri Türkçe,
 * API yolları ve parametreleri İngilizce (proje kuralı).
 */
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const slugs = parseCompareSlugs(req.nextUrl.searchParams.getAll("slug"));
    const whiskeys = await whiskeyService.getWhiskeysBySlugs(slugs);

    return createResponse(whiskeys, "Viskiler listelendi");
  } catch (error) {
    return handleApiError(error);
  }
}
