import { NextRequest } from "next/server";
import { createResponse, handleApiError } from "@/lib/api-response";
import connectToDatabase from "@/lib/db";
import { requireAdminUser } from "@/lib/auth/admin";
import { whiskeyService } from "@/server/services/WhiskeyService";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: { slug: string };
}

/** GET /api/whiskeys/[slug] — viski detayı (herkese açık) */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();
    const whiskey = await whiskeyService.getWhiskeyBySlug(params.slug);
    return createResponse(whiskey);
  } catch (error) {
    return handleApiError(error);
  }
}

/** PATCH /api/whiskeys/[slug] — viski güncelle (yalnızca yönetici) */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();
    await requireAdminUser();

    const body = await req.json();
    const whiskey = await whiskeyService.updateWhiskeyBySlug(params.slug, body);

    return createResponse(whiskey, "Viski güncellendi");
  } catch (error) {
    return handleApiError(error);
  }
}

/** DELETE /api/whiskeys/[slug] — viski sil (yalnızca yönetici) */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();
    await requireAdminUser();

    await whiskeyService.deleteWhiskeyBySlug(params.slug);
    return createResponse(null, "Viski silindi");
  } catch (error) {
    return handleApiError(error);
  }
}
