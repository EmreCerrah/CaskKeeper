import { z } from "zod";

export const CreateWhiskeySchema = z.object({
  brand: z.string().min(2, "Brand name must be at least 2 characters"),
  name: z.string().min(2, "Whiskey name must be at least 2 characters"),
  type: z.string().min(2, "Type is required"),
  region: z.string().min(2, "Region is required"),
  abv: z.number().min(0, "ABV must be a positive number").max(100, "ABV cannot exceed 100"),
});

export type CreateWhiskeyDTO = z.infer<typeof CreateWhiskeySchema>;
