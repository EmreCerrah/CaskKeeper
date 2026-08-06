import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CalendarDays, Mail } from "lucide-react";
import connectToDatabase from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { userService } from "@/server/services/UserService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { OfflineSyncCard } from "@/components/offline/OfflineSyncCard";
import { getLocale, getTranslations } from "@/lib/i18n/server";
import { INTL_LOCALE } from "@/lib/i18n/config";

export function generateMetadata(): Metadata {
  return { title: getTranslations()("profile.title") };
}
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/giris?donus=/profil");

  await connectToDatabase();
  const user = await userService.getById(session.userId);

  const t = getTranslations();

  const memberSince = new Date(user.createdAt).toLocaleDateString(INTL_LOCALE[getLocale()], {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10 sm:px-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">{t("profile.title")}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Mail className="h-4 w-4" aria-hidden />
            {user.email}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" aria-hidden />
            {t("profile.memberSince", { date: memberSince })}
          </span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif">{t("profile.infoTitle")}</CardTitle>
          <CardDescription>{t("profile.infoDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm user={user} />
        </CardContent>
      </Card>

      {/* Kullanıcı menüsündeki "Çevrimdışı Kullanım" girdisi buraya atlar.
          scroll-mt, yapışkan üst çubuğun başlığı örtmesini engeller. */}
      <div id="cevrimdisi" className="scroll-mt-20">
        <OfflineSyncCard userId={session.userId} userName={session.name} />
      </div>
    </div>
  );
}
