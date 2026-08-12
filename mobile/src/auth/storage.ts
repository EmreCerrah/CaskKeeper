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

export async function readToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function writeToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
