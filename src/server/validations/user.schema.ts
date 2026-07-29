import { z } from "zod";

// ---------------------------------------------------------------------------
// Kayıt / Giriş
// ---------------------------------------------------------------------------

export const RegisterSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalı").max(60, "İsim en fazla 60 karakter olabilir").trim(),
  email: z.string().email("Geçerli bir e-posta adresi giriniz").toLowerCase().trim(),
  password: z
    .string()
    .min(8, "Parola en az 8 karakter olmalı")
    .max(72, "Parola en fazla 72 karakter olabilir"),
});

export type RegisterDTO = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz").toLowerCase().trim(),
  password: z.string().min(1, "Parola zorunludur"),
});

export type LoginDTO = z.infer<typeof LoginSchema>;

// ---------------------------------------------------------------------------
// Profil Güncelleme
// ---------------------------------------------------------------------------

export const UpdateProfileSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalı").max(60, "İsim en fazla 60 karakter olabilir").trim().optional(),
  bio: z.string().max(500, "Hakkında yazısı en fazla 500 karakter olabilir").trim().optional().or(z.literal("")),
  profilePicture: z.string().url("Geçerli bir URL giriniz").optional().or(z.literal("")),
});

export type UpdateProfileDTO = z.infer<typeof UpdateProfileSchema>;
