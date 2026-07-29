import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays } from "lucide-react";
import connectToDatabase from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { userService } from "@/server/services/UserService";
import { tastingNoteService } from "@/server/services/TastingNoteService";
import { AppError } from "@/lib/errors";
import { Card } from "@/components/ui/card";
import { UserAvatar } from "@/components/social/UserAvatar";
import { FollowButton } from "@/components/social/FollowButton";
import { FriendBadge } from "@/components/social/FriendBadge";
import { TastingNoteCard } from "@/components/tasting/TastingNoteCard";
import { Pagination } from "@/components/shared/Pagination";

export const dynamic = "force-dynamic";

interface ProfilePageProps {
  params: { id: string };
  searchParams: { sayfa?: string };
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  await connectToDatabase();
  try {
    const profile = await userService.getPublicProfile(params.id);
    return { title: `${profile.name} — Profil` };
  } catch {
    return { title: "Kullanıcı Bulunamadı" };
  }
}

export default async function PublicProfilePage({ params, searchParams }: ProfilePageProps) {
  const session = await getSession();
  await connectToDatabase();

  let profile;
  try {
    profile = await userService.getPublicProfile(params.id, session?.userId);
  } catch (error) {
    if (error instanceof AppError && error.status === 404) notFound();
    throw error;
  }

  const page = Math.max(1, Number(searchParams.sayfa) || 1);
  const notes = await tastingNoteService.getPublicNotesByUser(
    params.id,
    { page, limit: 10 },
    session?.userId
  );

  const memberSince = new Date(profile.createdAt).toLocaleDateString("tr-TR", {
    month: "long",
    year: "numeric",
  });

  const stats = [
    { label: "Tadım", value: profile.publicNoteCount, href: null },
    { label: "Takipçi", value: profile.followerCount, href: `/kullanicilar/${profile.id}/takipciler` },
    { label: "Takip", value: profile.followingCount, href: `/kullanicilar/${profile.id}/takip-edilenler` },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6">
      {/* Profil başlığı */}
      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <UserAvatar name={profile.name} src={profile.profilePicture} size="lg" />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-serif text-2xl font-bold">{profile.name}</h1>
                {!profile.isOwnProfile && (
                  <FriendBadge
                    isMutual={profile.isMutual}
                    isFollowingViewer={profile.isFollowingViewer}
                  />
                )}
              </div>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                {memberSince} tarihinden beri üye
              </p>
            </div>
          </div>

          {session && !profile.isOwnProfile && (
            <FollowButton targetUserId={profile.id} initialFollowing={profile.isFollowedByViewer} />
          )}
          {profile.isOwnProfile && (
            <Link href="/profil" className="text-sm text-primary hover:underline">
              Profili düzenle
            </Link>
          )}
        </div>

        {profile.bio && <p className="mt-4 text-sm text-muted-foreground">{profile.bio}</p>}

        {/* İstatistikler */}
        <div className="mt-5 flex gap-6 border-t border-border/60 pt-4">
          {stats.map((stat) => {
            const content = (
              <>
                <span className="text-lg font-bold tabular-nums">{stat.value}</span>{" "}
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </>
            );
            return stat.href ? (
              <Link key={stat.label} href={stat.href} className="hover:text-primary">
                {content}
              </Link>
            ) : (
              <span key={stat.label}>{content}</span>
            );
          })}
        </div>
      </Card>

      {/* Herkese açık tadımlar */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl font-semibold">Herkese Açık Tadımlar</h2>
        {notes.data.length > 0 ? (
          <>
            {notes.data.map((note) => (
              <TastingNoteCard
                key={note.id}
                note={note}
                showActions={false}
                viewerIsAuthenticated={Boolean(session)}
              />
            ))}
            <Pagination
              page={notes.page}
              totalPages={notes.totalPages}
              basePath={`/kullanicilar/${profile.id}`}
            />
          </>
        ) : (
          <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
            <p className="font-medium">
              {profile.isOwnProfile
                ? "Henüz herkese açık tadımınız yok."
                : "Bu kullanıcının henüz herkese açık tadımı yok."}
            </p>
            {profile.isOwnProfile && (
              <p className="mt-1 text-sm">
                Tadım notlarınızı “Herkese açık” olarak işaretlerseniz burada görünür.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
