import type { FinishLength, TastingNoteInput, Visibility } from "./tastingNotes";

/**
 * @file note-payload.ts
 * @description Turns form state into the body the server expects — PURE.
 *
 * Kept out of tastingNotes.ts: that file pulls in react-query and the API
 * client and cannot be loaded under Node. The transformation worth testing is
 * here.
 *
 * These rules break quietly: the difference between sending an empty text
 * field as "" and not sending it at all, or a score that is not an integer,
 * ends in a validation error on the server that the user cannot explain.
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

/** Text that is empty or only whitespace is NOT sent as a field at all. */
function optionalText(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/** Drops blank tags and de-duplicates the rest — no rubbish reaches the server. */
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
    // The server receives this through z.coerce.date; ISO is the safest form.
    tastingDate: form.tastingDate.toISOString(),
    // The score is an integer from 0 to 100: the slider can produce decimals
    // and the server rejects them.
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

/** Adds a tag to the list or removes it (used by the picker). */
export function toggleTag(tags: string[], tag: string): string[] {
  return tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag];
}
