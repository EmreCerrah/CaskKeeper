import * as SecureStore from "expo-secure-store";

/**
 * @file storage.ts
 * @description Oturum token'ının cihazdaki yeri.
 *
 * AsyncStorage değil expo-secure-store: token 7 gün geçerli ve arkasında
 * kişisel tadım notları var. SecureStore Android'de Keystore'a, iOS'ta
 * Keychain'e yazıyor.
 *
 * Not: Android'de uygulama kaldırılınca veri silinir (iOS'ta kalabilir) —
 * bizim için sorun değil, token zaten yeniden alınabilir.
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
