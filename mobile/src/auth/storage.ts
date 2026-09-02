import * as SecureStore from "expo-secure-store";

/**
 * @file storage.ts
 * @description Where the session token lives on the device.
 *
 * expo-secure-store rather than AsyncStorage: the token is valid for seven
 * days and personal tasting notes sit behind it. SecureStore writes to the
 * Keystore on Android and the Keychain on iOS.
 *
 * Note: on Android the data is deleted when the app is uninstalled (on iOS it
 * may survive) — which is fine here, a token can always be fetched again.
 */

const TOKEN_KEY = "caskkeeper.session.token";

/**
 * Who the data cached on this device belongs to.
 *
 * Separate from the token because it outlives it. A token expires after seven
 * days and is cleared quietly on the next launch, but the cache it filled — the
 * user's own notes, and any write still queued — stays on disk. Without a name
 * on it there is no way to tell, when somebody next signs in, whether that data
 * is theirs.
 *
 * It sits beside the token rather than in AsyncStorage so everything the device
 * remembers about a session is in one file.
 */
const CACHE_OWNER_KEY = "caskkeeper.cache.owner";

export async function readToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function writeToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

/** Null when nothing has claimed the cache — including on an app updated from a version that did not record it. */
export async function readCacheOwner(): Promise<string | null> {
  return await SecureStore.getItemAsync(CACHE_OWNER_KEY);
}

export async function writeCacheOwner(userId: string): Promise<void> {
  await SecureStore.setItemAsync(CACHE_OWNER_KEY, userId);
}

export async function clearCacheOwner(): Promise<void> {
  await SecureStore.deleteItemAsync(CACHE_OWNER_KEY);
}
