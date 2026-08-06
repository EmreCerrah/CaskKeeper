import { getTranslations } from "@/lib/i18n/server";
import type { Metadata } from "next";
import Link from "next/link";
import connectToDatabase from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { userService } from "@/server/services/UserService";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { UserAvatar } from "@/components/social/UserAvatar";
import { RoleToggle } from "@/components/admin/RoleToggle";

export function generateMetadata(): Metadata {
  return { title: getTranslations()("admin.usersTitle") };
}
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getSession();
  await connectToDatabase();

  const users = await userService.listUsers();

  const t = getTranslations();

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        {t("admin.usersSubtitleBefore")} <span className="font-medium text-foreground">{users.length}</span>{" "}
        {t("admin.usersSubtitleAfter")}
      </p>

      <div className="space-y-2">
        {users.map((user) => {
          const isSelf = user.id === session?.userId;
          const isClosed = Boolean(user.closedAt);
          return (
            <Card
              key={user.id}
              className={`flex items-center justify-between gap-4 p-4 ${isClosed ? "opacity-60" : ""}`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <UserAvatar name={user.name} src={user.profilePicture} size="md" />
                <div className="min-w-0">
                  {/* Kapalı hesabın profili 404 döner; bağlantı verilmez. */}
                  {isClosed ? (
                    <span className="block truncate font-medium">{user.name}</span>
                  ) : (
                    <Link
                      href={`/kullanicilar/${user.id}`}
                      className="block truncate font-medium hover:text-primary"
                    >
                      {user.name}
                    </Link>
                  )}
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
                {user.role === "admin" && <Badge variant="gold">{t("admin.roleAdmin")}</Badge>}
                {isClosed && <Badge variant="outline">{t("admin.accountClosed")}</Badge>}
              </div>

              {/* Kapalı hesapta rol değiştirilemez — servis zaten reddeder. */}
              {!isClosed && <RoleToggle userId={user.id} role={user.role} isSelf={isSelf} />}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
