/**
 * @file preference.ts
 * @description The state of the "offline access" switch.
 *
 * This is an interface preference (on/off), not personal data — so
 * localStorage is enough, and being readable synchronously is what lets the
 * switch render in the right position on the first paint. The user data itself
 * lives in the Cache API (see store.ts).
 *
 * The default is OFF: nobody's data reaches their device unasked.
 */

const STORAGE_KEY = "caskkeeper:offline-enabled";
const PREFERENCE_EVENT = "caskkeeper:offline-preference";

export function isOfflineEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    // Accessing localStorage can throw in a private window.
    return false;
  }
}

export function setOfflineEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (enabled) window.localStorage.setItem(STORAGE_KEY, "1");
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // If it cannot be written the preference will not persist; the event is
    // still dispatched so listeners update for this session.
  }
  window.dispatchEvent(new CustomEvent(PREFERENCE_EVENT, { detail: enabled }));
}

/** For learning that the switch was changed from another component. */
export function subscribeOfflinePreference(callback: (enabled: boolean) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const onPreference = (event: Event) => callback((event as CustomEvent<boolean>).detail);
  // A change in another tab arrives as a storage event.
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) callback(isOfflineEnabled());
  };

  window.addEventListener(PREFERENCE_EVENT, onPreference);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(PREFERENCE_EVENT, onPreference);
    window.removeEventListener("storage", onStorage);
  };
}
