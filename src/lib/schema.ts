import { z } from "zod";

export const formSchema = z.object({
  query: z
    .string({
      message: "atleast write 2 letters 🥺",
    })
    .min(2)
    .max(50),
});

export const aiResponseSchema = z.object({
  type: z.enum(["overlay", "emoji", "image", "outsource"]),
  output: z.string(),
});
