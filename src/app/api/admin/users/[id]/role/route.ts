import { NextRequest } from "next/server";
import { z } from "zod";
import { createResponse, handleApiError } from "@/lib/api-response";
import connectToDatabase from "@/lib/db";
import { requireAdminUser } from "@/lib/auth/admin";
import { userService } from "@/server/services/UserService";
import { ValidationError } from "@/lib/errors";

export const dynamic = "force-dynamic";

const RoleSchema = z.object({
  role: z.enum(["user", "admin"], { errorMap: () => ({ message: "Geçersiz rol" }) }),
});

interface RouteParams {
  params: { id: string };
}

/** PATCH /api/admin/users/[id]/role — kullanıcı rolünü değiştir (yalnızca yönetici) */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();
    const session = await requireAdminUser();

    const parsed = RoleSchema.safeParse(await req.json());
    if (!parsed.success) {
      throw new ValidationError("Geçersiz rol", parsed.error.flatten().fieldErrors);
    }

    const user = await userService.setRole(session.userId, params.id, parsed.data.role);

    return createResponse(
      user,
      parsed.data.role === "admin" ? "Yönetici yetkisi verildi" : "Yönetici yetkisi kaldırıldı"
    );
  } catch (error) {
    return handleApiError(error);
  }
}
