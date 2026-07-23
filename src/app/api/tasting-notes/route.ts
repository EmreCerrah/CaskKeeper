import { NextRequest } from "next/server";
import { createResponse, handleApiError } from "@/lib/api-response";
import connectToDatabase from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { tastingNoteService } from "@/server/services/TastingNoteService";

export const dynamic = "force-dynamic";

/**
 * GET /api/tasting-notes — oturum sahibinin notları
 * Query parametreleri: whiskeyId, favorites=true, page, limit, sortBy, sortOrder
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    await connectToDatabase();

    const params = req.nextUrl.searchParams;
    const notes = await tastingNoteService.getNotesByUser(
      session.userId,
      {
        whiskeyId: params.get("whiskeyId") ?? undefined,
        onlyFavorites: params.get("favorites") === "true" ? true : undefined,
      },
      {
        page: params.get("page") ? Number(params.get("page")) : undefined,
        limit: params.get("limit") ? Number(params.get("limit")) : undefined,
        sortBy: (params.get("sortBy") as "tastingDate" | "rating" | "createdAt") ?? undefined,
        sortOrder: (params.get("sortOrder") as "asc" | "desc") ?? undefined,
      }
    );

    return createResponse(notes, "Tadım notları listelendi");
  } catch (error) {
    return handleApiError(error);
  }
}

/** POST /api/tasting-notes — yeni tadım notu */
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    await connectToDatabase();

    const body = await req.json();
    const note = await tastingNoteService.createNote(session.userId, body);

    return createResponse(note, "Tadım notu kaydedildi", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
