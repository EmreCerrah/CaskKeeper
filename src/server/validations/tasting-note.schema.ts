import { z } from "zod";
import { mk } from "@/lib/i18n/message-key";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

/**
 * Tadım notu oluşturma şeması.
 * `user` alanı istemciden ASLA alınmaz — service katmanı oturumdan ekler.
 */
export const CreateTastingNoteSchema = z.object({
  whiskey: z.string().regex(objectIdRegex, mk("validation.whiskeyIdInvalid")),

  tastingDate: z.coerce.date({ errorMap: () => ({ message: mk("validation.tastingDateRequired") }) }),

  rating: z
    .number({ invalid_type_error: mk("validation.ratingNumber") })
    .min(0, mk("validation.ratingRange"))
    .max(100, mk("validation.ratingRange")),

  noseTags: z.array(z.string().trim()).default([]),
  noseNotes: z.string().max(1000, mk("validation.noseNotesMax")).optional().or(z.literal("")),

  palateTags: z.array(z.string().trim()).default([]),
  palateNotes: z.string().max(1000, mk("validation.palateNotesMax")).optional().or(z.literal("")),

  finishTags: z.array(z.string().trim()).default([]),
  finishNotes: z.string().max(1000, mk("validation.finishNotesMax")).optional().or(z.literal("")),
  finishLength: z.enum(["short", "medium", "long"], {
    errorMap: () => ({ message: mk("validation.finishLengthRequired") }),
  }),

  personalNotes: z.string().max(2000, mk("validation.personalNotesMax")).optional().or(z.literal("")),
  visibility: z.enum(["private", "public"]).default("private"),
  isFavorite: z.boolean().default(false),
});

export type CreateTastingNoteDTO = z.infer<typeof CreateTastingNoteSchema>;

/** Güncellemede viski değiştirilemez — not, viskiye bağlı bir seans kaydıdır. */
export const UpdateTastingNoteSchema = CreateTastingNoteSchema.omit({ whiskey: true }).partial();

export type UpdateTastingNoteDTO = z.infer<typeof UpdateTastingNoteSchema>;
