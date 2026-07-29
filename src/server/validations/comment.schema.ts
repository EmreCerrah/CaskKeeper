import { z } from "zod";

export const CreateCommentSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Yorum boş olamaz")
    .max(1000, "Yorum en fazla 1000 karakter olabilir"),
});

export type CreateCommentDTO = z.infer<typeof CreateCommentSchema>;
