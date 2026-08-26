import { clearOfflineSnapshot } from "@/lib/offline/store";
import { setOfflineEnabled } from "@/lib/offline/preference";
import { resetSyncThrottle } from "@/lib/offline/sync";

/**
 * The client-side sign-out flow.
 *
 * As well as dropping the session cookie it deletes the offline copy from the
 * device — otherwise, on a shared machine, the previous user's tasting notes
 * would still be readable from the /offline page after signing out.
 *
 * Sign-out was triggered from two places (UserMenu and MobileTabBar); the flow
 * was gathered here so the cleanup could not be forgotten in one of them.
 */
export async function logoutClient(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
  await clearOfflineSnapshot();
  // The switch is turned off too: otherwise the next person to sign in on this
  // device would inherit offline storage switched on without ever asking for
  // it.
  setOfflineEnabled(false);
  resetSyncThrottle();
}
