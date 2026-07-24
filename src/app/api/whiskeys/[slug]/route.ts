import { createResponse, handleApiError } from "@/lib/api-response";
import connectToDatabase from "@/lib/db";
import { whiskeyService } from "@/server/services/WhiskeyService";

interface RouteParams {
  params: { slug: string };
}

/** GET /api/whiskeys/[slug] — viski detayı */
export async function GET(_req: Request, { params }: RouteParams) {
  try {
    await connectToDatabase();
    const whiskey = await whiskeyService.getWhiskeyBySlug(params.slug);
    return createResponse(whiskey);
  } catch (error) {
    return handleApiError(error);
  }
}
