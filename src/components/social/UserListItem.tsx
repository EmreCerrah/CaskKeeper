import Link from "next/link";
import type { PublicUserDTO } from "@/lib/types/dto";
import { Card } from "@/components/ui/card";
import { UserAvatar } from "./UserAvatar";

interface UserListItemProps {
  user: PublicUserDTO;
}

/** Takipçi/takip listelerinde bir kullanıcı satırı. */
export function UserListItem({ user }: UserListItemProps) {
  return (
    <Link href={`/kullanicilar/${user.id}`}>
      <Card className="flex items-center gap-3 p-3 transition-colors hover:border-primary/40">
        <UserAvatar name={user.name} src={user.profilePicture} size="md" />
        <span className="font-medium">{user.name}</span>
      </Card>
    </Link>
  );
}
