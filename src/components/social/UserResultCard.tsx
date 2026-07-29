import Link from "next/link";
import { NotebookPen } from "lucide-react";
import type { UserSearchResultDTO } from "@/lib/types/dto";
import { Card } from "@/components/ui/card";
import { UserAvatar } from "./UserAvatar";
import { FollowButton } from "./FollowButton";
import { FriendBadge } from "./FriendBadge";

interface UserResultCardProps {
  user: UserSearchResultDTO;
  /** Giriş yapılmamışsa takip butonu yerine giriş bağlantısı gösterilir */
  isAuthenticated: boolean;
}

/** Arama ve keşfet listelerindeki kullanıcı kartı. */
export function UserResultCard({ user, isAuthenticated }: UserResultCardProps) {
  return (
    <Card className="flex items-center justify-between gap-4 p-4">
      <Link href={`/kullanicilar/${user.id}`} className="flex min-w-0 items-center gap-3">
        <UserAvatar name={user.name} src={user.profilePicture} size="md" />
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-medium hover:text-primary">{user.name}</span>
            <FriendBadge isMutual={user.isMutual} isFollowingViewer={user.isFollowingViewer} />
          </div>
          {user.bio && <p className="truncate text-xs text-muted-foreground">{user.bio}</p>}
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <NotebookPen className="h-3 w-3" aria-hidden />
            {user.publicNoteCount} herkese açık tadım
          </p>
        </div>
      </Link>

      <div className="shrink-0">
        {isAuthenticated ? (
          <FollowButton targetUserId={user.id} initialFollowing={user.isFollowedByViewer} />
        ) : (
          <Link href="/giris" className="text-sm text-primary hover:underline">
            Takip için giriş yapın
          </Link>
        )}
      </div>
    </Card>
  );
}
