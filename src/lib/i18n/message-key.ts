import type { TranslationKey } from "./translate";

/**
 * @file message-key.ts
 * @description Zod mesajlarını çeviri anahtarına bağlayan sarmalayıcı.
 *
 * Zod `min(2, message)` imzası düz `string` ister, dolayısıyla anahtar yazımını
 * kendiliğinden denetlemez. `mk()` araya girip anahtarı tip sistemine
 * doğrulatır: sözlükte olmayan bir anahtar derleme hatası verir.
 *
 * Çeviri burada YAPILMAZ — şemalar modül seviyesinde bir kez kurulur, oysa dil
 * her isteğe göre değişir. Anahtar `fieldErrors` içinde taşınır ve
 * handleApiError isteğin dilinde metne çevirir.
 */
export const mk = (key: TranslationKey): string => key;
