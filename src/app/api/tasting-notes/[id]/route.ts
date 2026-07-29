import { NextRequest } from "next/server";
import { createResponse, handleApiError } from "@/lib/api-response";
import connectToDatabase from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { tastingNoteService } from "@/server/services/TastingNoteService";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: { id: string };
}

/** GET /api/tasting-notes/[id] */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireSession();
    await connectToDatabase();

    const note = await tastingNoteService.getNoteForUser(params.id, session.userId);
    return createResponse(note);
  } catch (error) {
    return handleApiError(error);
  }
}

/** PATCH /api/tasting-notes/[id] — kısmi güncelleme (favori toggle dahil) */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireSession();
    await connectToDatabase();

    const body = await req.json();
    const note = await tastingNoteService.updateNote(params.id, session.userId, body);

    return createResponse(note, "Tadım notu güncellendi");
  } catch (error) {
    return handleApiError(error);
  }
}

/** DELETE /api/tasting-notes/[id] */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireSession();
    await connectToDatabase();

    await tastingNoteService.deleteNote(params.id, session.userId);
    return createResponse(null, "Tadım notu silindi");
  } catch (error) {
    return handleApiError(error);
  }
}
