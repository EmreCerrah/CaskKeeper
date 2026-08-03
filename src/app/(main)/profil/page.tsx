import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CalendarDays, Mail } from "lucide-react";
import connectToDatabase from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { userService } from "@/server/services/UserService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/profile/ProfileForm";

export const metadata: Metadata = { title: "Profilim" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/giris?donus=/profil");

  await connectToDatabase();
  const user = await userService.getById(session.userId);

  const memberSince = new Date(user.createdAt).toLocaleDateString("tr-TR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10 sm:px-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Profilim</h1>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Mail className="h-4 w-4" aria-hidden />
            {user.email}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" aria-hidden />
            {memberSince} tarihinden beri üye
          </span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Profil Bilgileri</CardTitle>
          <CardDescription>Adınızı, hakkınızda yazınızı ve profil fotoğrafınızı güncelleyin.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm user={user} />
        </CardContent>
      </Card>
    </div>
  );
}
