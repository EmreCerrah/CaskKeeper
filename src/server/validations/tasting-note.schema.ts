import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

/**
 * Tadım notu oluşturma şeması.
 * `user` alanı istemciden ASLA alınmaz — service katmanı oturumdan ekler.
 */
export const CreateTastingNoteSchema = z.object({
  whiskey: z.string().regex(objectIdRegex, "Geçersiz viski kimliği"),

  tastingDate: z.coerce.date({ errorMap: () => ({ message: "Geçerli bir tarih giriniz" }) }),

  rating: z
    .number({ invalid_type_error: "Puan sayı olmalı" })
    .min(0, "Puan 0'dan küçük olamaz")
    .max(100, "Puan 100'den büyük olamaz"),

  noseTags: z.array(z.string().trim()).default([]),
  noseNotes: z.string().max(1000, "Burun notu en fazla 1000 karakter olabilir").optional().or(z.literal("")),

  palateTags: z.array(z.string().trim()).default([]),
  palateNotes: z.string().max(1000, "Damak notu en fazla 1000 karakter olabilir").optional().or(z.literal("")),

  finishTags: z.array(z.string().trim()).default([]),
  finishNotes: z.string().max(1000, "Bitiş notu en fazla 1000 karakter olabilir").optional().or(z.literal("")),
  finishLength: z.enum(["short", "medium", "long"], {
    errorMap: () => ({ message: "Bitiş uzunluğu seçiniz" }),
  }),

  personalNotes: z.string().max(2000, "Kişisel notlar en fazla 2000 karakter olabilir").optional().or(z.literal("")),
  visibility: z.enum(["private", "public"]).default("private"),
  isFavorite: z.boolean().default(false),
});

export type CreateTastingNoteDTO = z.infer<typeof CreateTastingNoteSchema>;

/** Güncellemede viski değiştirilemez — not, viskiye bağlı bir seans kaydıdır. */
export const UpdateTastingNoteSchema = CreateTastingNoteSchema.omit({ whiskey: true }).partial();

export type UpdateTastingNoteDTO = z.infer<typeof UpdateTastingNoteSchema>;
