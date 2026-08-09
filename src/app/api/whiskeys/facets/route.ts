import { createResponse, handleApiError } from "@/lib/api-response";
import connectToDatabase from "@/lib/db";
import { whiskeyService } from "@/server/services/WhiskeyService";

export const dynamic = "force-dynamic";

/**
 * GET /api/whiskeys/facets — katalogdaki tip/bölge/ülke değerleri.
 * Filtre menülerini doldurmak için; web'de sayfa bunu servisten doğrudan alıyor.
 *
 * Yol [slug] ile aynı seviyede: Next.js statik segmente öncelik verdiği için
 * çalışır. Yalnızca "facets" slug'lı bir viski API'den erişilemez olurdu.
 */
export async function GET() {
  try {
    await connectToDatabase();

    const facets = await whiskeyService.getFacets();
    return createResponse(facets);
  } catch (error) {
    return handleApiError(error);
  }
}
