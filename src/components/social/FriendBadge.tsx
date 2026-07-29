import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FriendBadgeProps {
  /** Karşılıklı takip varsa "Arkadaş", yalnızca karşı taraf takip ediyorsa bilgi rozeti */
  isMutual: boolean;
  isFollowingViewer: boolean;
}

/**
 * Takip ilişkisini insan diline çevirir:
 * - Karşılıklı takip → "Arkadaş"
 * - Yalnızca o kişi sizi takip ediyor → "Sizi takip ediyor"
 */
export function FriendBadge({ isMutual, isFollowingViewer }: FriendBadgeProps) {
  if (isMutual) {
    return (
      <Badge variant="gold" className="gap-1">
        <Users className="h-3 w-3" aria-hidden />
        Arkadaş
      </Badge>
    );
  }

  if (isFollowingViewer) {
    return <Badge variant="outline">Sizi takip ediyor</Badge>;
  }

  return null;
}
