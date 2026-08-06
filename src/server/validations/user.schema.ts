import { z } from "zod";
import { mk } from "@/lib/i18n/message-key";

// ---------------------------------------------------------------------------
// Kayıt / Giriş
// ---------------------------------------------------------------------------

export const RegisterSchema = z.object({
  name: z.string().min(2, mk("validation.nameMin")).max(60, mk("validation.nameMax")).trim(),
  email: z.string().email(mk("validation.email")).toLowerCase().trim(),
  password: z
    .string()
    .min(8, mk("validation.passwordMin"))
    .max(72, mk("validation.passwordMax")),
});

export type RegisterDTO = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email(mk("validation.email")).toLowerCase().trim(),
  password: z.string().min(1, mk("validation.passwordRequired")),
});

export type LoginDTO = z.infer<typeof LoginSchema>;

// ---------------------------------------------------------------------------
// Profil Güncelleme
// ---------------------------------------------------------------------------

export const UpdateProfileSchema = z.object({
  name: z.string().min(2, mk("validation.nameMin")).max(60, mk("validation.nameMax")).trim().optional(),
  bio: z.string().max(500, mk("validation.bioMax")).trim().optional().or(z.literal("")),
  profilePicture: z.string().url(mk("validation.url")).optional().or(z.literal("")),
});

export type UpdateProfileDTO = z.infer<typeof UpdateProfileSchema>;
