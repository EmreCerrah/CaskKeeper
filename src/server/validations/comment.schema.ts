import { z } from "zod";
import { mk } from "@/lib/i18n/message-key";

export const CreateCommentSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, mk("validation.commentRequired"))
    .max(1000, mk("validation.commentMax")),
});

export type CreateCommentDTO = z.infer<typeof CreateCommentSchema>;
