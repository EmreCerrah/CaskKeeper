import type { Metadata } from "next";
import { Suspense } from "react";
import { Users } from "lucide-react";
import connectToDatabase from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { userService } from "@/server/services/UserService";
import { UserSearchBar } from "@/components/social/UserSearchBar";
import { UserResultCard } from "@/components/social/UserResultCard";
import { getTranslations } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  return { title: getTranslations()("people.title") };
}
export const dynamic = "force-dynamic";

interface DiscoverPeoplePageProps {
  searchParams: { arama?: string };
}

export default async function DiscoverPeoplePage({ searchParams }: DiscoverPeoplePageProps) {
  const session = await getSession();
  await connectToDatabase();

  const query = searchParams.arama ?? "";
  const users = await userService.searchUsers(query, session?.userId);

  const isSearching = query.trim().length > 0;
  const t = getTranslations();

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10 sm:px-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">{t("people.title")}</h1>
        <p className="mt-1 text-muted-foreground">
          {t("people.subtitlePrefix")}{" "}
          <span className="text-primary">{t("people.friend")}</span>{" "}
          {t("people.subtitleSuffix")}
        </p>
      </div>

      <Suspense>
        <UserSearchBar />
      </Suspense>

      {!isSearching && users.length > 0 && (
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {t("people.newMembers")}
        </h2>
      )}

      {users.length > 0 ? (
        <div className="space-y-2">
          {users.map((user) => (
            <UserResultCard key={user.id} user={user} isAuthenticated={Boolean(session)} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed py-20 text-center text-muted-foreground">
          <Users className="mx-auto mb-3 h-10 w-10 text-primary/50" aria-hidden />
          <p className="font-medium">
            {isSearching ? t("people.noMatches", { query }) : t("people.noUsers")}
          </p>
          {isSearching && <p className="mt-1 text-sm">{t("people.tryAnotherName")}</p>}
        </div>
      )}
    </div>
  );
}
