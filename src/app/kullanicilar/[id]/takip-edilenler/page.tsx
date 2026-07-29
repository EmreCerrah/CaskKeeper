import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import connectToDatabase from "@/lib/db";
import { userService } from "@/server/services/UserService";
import { followService } from "@/server/services/FollowService";
import { AppError } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { UserListItem } from "@/components/social/UserListItem";

export const metadata: Metadata = { title: "Takip Edilenler" };
export const dynamic = "force-dynamic";

interface FollowingPageProps {
  params: { id: string };
}

export default async function FollowingPage({ params }: FollowingPageProps) {
  await connectToDatabase();

  let profile;
  try {
    profile = await userService.getPublicProfile(params.id);
  } catch (error) {
    if (error instanceof AppError && error.status === 404) notFound();
    throw error;
  }

  const following = await followService.getFollowing(params.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10 sm:px-6">
      <Button asChild variant="ghost" size="sm">
        <Link href={`/kullanicilar/${params.id}`}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {profile.name} profiline dön
        </Link>
      </Button>

      <h1 className="font-serif text-2xl font-bold">
        {profile.name} — Takip Edilenler ({profile.followingCount})
      </h1>

      {following.length > 0 ? (
        <div className="space-y-2">
          {following.map((user) => (
            <UserListItem key={user.id} user={user} />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
          Henüz kimse takip edilmiyor.
        </p>
      )}
    </div>
  );
}
