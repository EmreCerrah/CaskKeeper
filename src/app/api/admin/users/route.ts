import { createResponse, handleApiError } from "@/lib/api-response";
import connectToDatabase from "@/lib/db";
import { requireAdminUser } from "@/lib/auth/admin";
import { userService } from "@/server/services/UserService";

export const dynamic = "force-dynamic";

/** GET /api/admin/users — kullanıcı listesi (yalnızca yönetici) */
export async function GET() {
  try {
    await connectToDatabase();
    await requireAdminUser();

    const users = await userService.listUsers();
    return createResponse(users, "Kullanıcılar listelendi");
  } catch (error) {
    return handleApiError(error);
  }
}
