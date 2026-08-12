import { onlineManager } from "@tanstack/react-query";
import * as Network from "expo-network";

/**
 * @file online.ts
 * @description Reports the device's network state to TanStack Query.
 *
 * By default the library assumes "online" forever on React Native. Refetching
 * on reconnect, and not retrying pointlessly while offline, both rest on this
 * wiring.
 *
 * expo-network is used rather than a community package — it is Expo's own
 * module and already reports the same thing.
 */
export function startOnlineManager(): () => void {
  // Ask once at startup: the listener only fires on CHANGE, so if the app
  // launches in airplane mode the initial state would never be reported.
  Network.getNetworkStateAsync()
    .then((state) => onlineManager.setOnline(Boolean(state.isInternetReachable ?? state.isConnected)))
    .catch(() => {
      // If the state cannot be read, assume online: the request is attempted
      // and the real error reaches the user through the normal path.
      onlineManager.setOnline(true);
    });

  const subscription = Network.addNetworkStateListener((state) => {
    onlineManager.setOnline(Boolean(state.isInternetReachable ?? state.isConnected));
  });

  return () => subscription.remove();
}
