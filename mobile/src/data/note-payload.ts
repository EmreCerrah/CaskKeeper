import type { FinishLength, TastingNoteInput, Visibility } from "./tastingNotes";

/**
 * @file note-payload.ts
 * @description Form durumunu sunucunun beklediği gövdeye çevirir — SAF.
 *
 * tastingNotes.ts'ten ayrı: orası react-query ve API istemcisini içeri alıyor,
 * Node altında kurulamıyor. Sınanmaya değen dönüşüm burada.
 *
 * Buradaki kurallar sessizce bozulabilecek türden: boş bir metin alanını "" ile
 * göndermek ile hiç göndermemek arasındaki fark, ya da puanın tam sayı
 * olmaması, sunucuda doğrulama hatasına düşer ve kullanıcı sebebini anlamaz.
 */

export interface NoteFormState {
  whiskeyId: string;
  tastingDate: Date;
  rating: number;
  noseTags: string[];
  noseNotes: string;
  palateTags: string[];
  palateNotes: string;
  finishTags: string[];
  finishNotes: string;
  finishLength: FinishLength;
  personalNotes: string;
  visibility: Visibility;
  isFavorite: boolean;
}

/** Boş ya da yalnızca boşluktan oluşan metni alan olarak HİÇ göndermez. */
function optionalText(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/** Etiketlerden boşları atar ve yinelenenleri teker — sunucuya çöp gitmesin. */
function cleanTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const trimmed = tag.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    result.push(trimmed);
  }

  return result;
}

export function toNotePayload(form: NoteFormState): TastingNoteInput {
  return {
    whiskey: form.whiskeyId,
    // Sunucu z.coerce.date ile karşılıyor; ISO en güvenli biçim.
    tastingDate: form.tastingDate.toISOString(),
    // Puan 0–100 tam sayı: kaydırıcı ondalık üretebilir, sunucu reddeder.
    rating: Math.round(Math.min(100, Math.max(0, form.rating))),
    noseTags: cleanTags(form.noseTags),
    noseNotes: optionalText(form.noseNotes),
    palateTags: cleanTags(form.palateTags),
    palateNotes: optionalText(form.palateNotes),
    finishTags: cleanTags(form.finishTags),
    finishNotes: optionalText(form.finishNotes),
    finishLength: form.finishLength,
    personalNotes: optionalText(form.personalNotes),
    visibility: form.visibility,
    isFavorite: form.isFavorite,
  };
}

/** Bir etiketi listeye ekler ya da listeden çıkarır (seçici için). */
export function toggleTag(tags: string[], tag: string): string[] {
  return tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag];
}
