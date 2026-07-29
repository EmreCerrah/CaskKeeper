import { createResponse, handleApiError } from "@/lib/api-response";
import connectToDatabase from "@/lib/db";
import { requireSession } from "@/lib/auth/session";
import { userService } from "@/server/services/UserService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireSession();
    await connectToDatabase();
    const user = await userService.getById(session.userId);
    return createResponse(user);
  } catch (error) {
    return handleApiError(error);
  }
}
