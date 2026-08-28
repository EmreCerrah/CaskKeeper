import type { TranslationKey } from "./translate";

/**
 * @file message-key.ts
 * @description The wrapper that ties Zod messages to translation keys.
 *
 * Zod's `min(2, message)` signature takes a plain `string`, so it cannot check
 * the spelling of a key by itself. `mk()` steps in and has the type system
 * verify it: a key that is not in the dictionary is a compile error.
 *
 * No translation happens here — schemas are built once at module level, while
 * the language changes per request. The key travels inside `fieldErrors` and
 * handleApiError renders it in the language of the request.
 */
export const mk = (key: TranslationKey): string => key;
