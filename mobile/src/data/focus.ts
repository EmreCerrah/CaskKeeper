import { focusManager } from "@tanstack/react-query";
import { AppState, type AppStateStatus } from "react-native";

/**
 * @file focus.ts
 * @description Tells TanStack Query whether the app is in the foreground.
 *
 * The twin of online.ts: that one carries network state, this one carries
 * focus. The library listens for the browser's `window.focus` event, which
 * does not exist on React Native — and until this is wired up,
 * `refetchOnWindowFocus` does nothing at all, silently.
 *
 * The global default stays `false` (see queryClient.ts: hitting the network on
 * every return drains the battery). This wiring is only for queries that opt
 * in: the notification badge has to be current when the app comes back.
 */
export function startFocusManager(): () => void {
  const subscription = AppState.addEventListener("change", (status: AppStateStatus) => {
    // "inactive" is neither foreground nor background — it is the state iOS
    // passes through when the notification centre or the app switcher opens.
    // Treating it as lost focus would start a pointless refetch every time the
    // user came back.
    focusManager.setFocused(status === "active");
  });

  return () => subscription.remove();
}
