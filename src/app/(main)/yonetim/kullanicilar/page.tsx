import type { Metadata } from "next";
import Link from "next/link";
import connectToDatabase from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { userService } from "@/server/services/UserService";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { UserAvatar } from "@/components/social/UserAvatar";
import { RoleToggle } from "@/components/admin/RoleToggle";

export const metadata: Metadata = { title: "Kullanıcı Yönetimi" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getSession();
  await connectToDatabase();

  const users = await userService.listUsers();

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        Sistemde <span className="font-medium text-foreground">{users.length}</span> kullanıcı var.
        Yönetici yetkisi verdiğiniz kişiler kataloğu düzenleyebilir.
      </p>

      <div className="space-y-2">
        {users.map((user) => {
          const isSelf = user.id === session?.userId;
          return (
            <Card key={user.id} className="flex items-center justify-between gap-4 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <UserAvatar name={user.name} src={user.profilePicture} size="md" />
                <div className="min-w-0">
                  <Link
                    href={`/kullanicilar/${user.id}`}
                    className="block truncate font-medium hover:text-primary"
                  >
                    {user.name}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
                {user.role === "admin" && <Badge variant="gold">Yönetici</Badge>}
              </div>

              <RoleToggle userId={user.id} role={user.role} isSelf={isSelf} />
            </Card>
          );
        })}
      </div>
    </div>
  );
}
