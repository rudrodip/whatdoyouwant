import { z } from "zod";

export const formSchema = z.object({
  query: z
    .string({
      message: "atleast write 2 letters 🥺",
    })
    .min(2)
    .max(50),
});
