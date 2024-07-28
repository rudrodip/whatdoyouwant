"use server";

import { z } from "zod";
import { getOverlayImageUrl } from "@/lib/unsplash";
import { getGeminiResponse } from "@/lib/ai";
import { createMemeImage } from "@/lib/processing";
import path from "path";
import fs from "fs"

path.resolve("./assets/fonts/impact.ttf")
path.resolve("./public/**/*")

const aiResponseSchema = z.object({
  type: z.enum(["overlay", "emoji", "image", "outsource"]),
  output: z.string(),
});

type AiResponse = z.infer<typeof aiResponseSchema>;

const generatePrompt = (query: string) => `
I am making a meme website, and you're the core ai behind it. Your task is to generate good structured response for me. So, basically i ask users "what do you want?", and the user responds. based on the query, i show a meme. But there are some special cases.
Your output structure: { type: string output: string } json schema
There are three types: 1. overlay 2. emoji 3. image 4. outsource

Here's the list of direct image you can use:
1. https://c.tenor.com/O69qbS-sDkUAAAAC/tenor.gif
2. /special-case/enemy-meme.jpeg
3. /special-case/foodie.jpeg

If anyone tries to flirt, like they respond with "you" or kiss or hug or similar romantic query, respond with the direct image "https://c.tenor.com/O69qbS-sDkUAAAAC/tenor.gif"
If anyone tries to say something rude or cute or something villain-ish like blood, similar, respond with the direct image "/special-case/enemy-meme.jpeg"
If anyone asks for heavy food, like pizza, burger or junkfood, respond with the direct image: "/special-case/foodie.jpeg"

Here're some special cases:
query - cat / kitten or similar, respond with any one of these overlay images:
1. special-case/cat.png
2. special-case/cat-sleep.jpeg
3. special-case/cat-smol.jpeg
4. special-case/cat-upset.jpeg

If cute cat, or cute pet, or baby respond with this overlay image: special-case/pookie.jpeg

If anyone asks for cold coffee/iced coffee, respond with the overlay image: special-case/cold-coffee.png
For milkshake: special-case/milkshake.jpg
For iphone: special-case/iphone.png

And for other cases, try responding with a single emoji.

And if all the cases fails, just respond with outsource type, and query itself

Examples:
1. query: "cat", response: { type: "overlay", output: "/special-case/cat.png" }
2. query: "cute cat", response: { type: "overlay", output: "/special-case/pookie.jpeg" }
3. query: "cold coffee", response: { type: "overlay", output: "/special-case/cold-coffee.png" }
4. query: "iphone", response: { type: "overlay", output: "/special-case/iphone.png" }
5. query: "pizza", response: { type: "overlay", output: "/special-case/foodie.jpeg" }
6. query: "you", response: { type: "image", output: "https://c.tenor.com/O69qbS-sDkUAAAAC/tenor.gif" }
7. query: "laptop", response: { type: "emoji", output: "💻" }
8. query: "you're cute", response: { type: "image", output: "https://c.tenor.com/O69qbS-sDkUAAAAC/tenor.gif" }
9. query: "enemy", response: { type: "image", output: "/special-case/enemy-meme.jpeg" }
10. query: "tea", response: { type: "emoji", output: "🍵" }
11. query: "tree", response: { type: "outsource", output: "tree" }
12. query: "dog", response: { type: "outsource", output: "dog" }


Try your best to just use special cases, and emojis. if not then just use outsource type.
Here's the query: ${query}
`;

export const generateMeme = async (query: string) => {
  try {
    let aiResponseString = await getGeminiResponse(generatePrompt(query));
    if (!aiResponseString) return null;

    if (aiResponseString.includes("`")) {
      const aiResArray = aiResponseString.split("\n")
      aiResArray.shift()
      aiResArray.pop()
      aiResponseString = aiResArray.join("\n")
    }

    const aiResponse: AiResponse = JSON.parse(aiResponseString);
    const parsedResponse = aiResponseSchema.safeParse(aiResponse);
    if (!parsedResponse.success) return null;

    const { type, output } = parsedResponse.data;

    if (type === "image") {
      return output;
    }

    let basePath = process.cwd()
    // if (process.env.NODE_ENV === 'production') {
    //   basePath = path.join(process.cwd(), '.next/server/chunks')
    // }

    // print all the folders in the cwd
    console.log("CWD:", process.cwd())
    let folders = fs.readdirSync(process.cwd())
    console.log("Folders:", folders)

    if (type === "outsource") {
      const imageUrl = await getOverlayImageUrl(query);
      if (!imageUrl) return null;
      return createMemeImage(query, "image", imageUrl);
    }

    if (type === "overlay") {
      const overlayPath = path.join(basePath, "public", output);
      return createMemeImage(query, "image", overlayPath);
    }

    if (type === "emoji") {
      return createMemeImage(query, "emoji", output);
    }

    return null;
  } catch (error) {
    console.error("Error generating meme:", error);
    return null;
  }
};
