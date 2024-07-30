"use server";

import { z } from "zod";
import { getOverlayImageUrl } from "@/lib/unsplash";
import { getGeminiResponse } from "@/lib/ai";
import { createMemeImage } from "@/lib/processing";
import path from "path";
import { storeInformation } from "@/lib/firebase";
import { headers } from "next/headers";

path.resolve(process.cwd(), "assets", "fonts", "fonts.conf");
path.resolve(process.cwd(), "assets", "fonts", "impact.ttf");
path.resolve(process.cwd(), "assets", "fonts", "noto.ttf");
path.resolve("./public/**/*");

export const generateMeme = async (query: string, ref?: string) => {
  const ip = IP();

  try {
    let aiResponseString = await getGeminiResponse(generatePrompt(query));
    if (!aiResponseString) return null;

    if (aiResponseString.includes("`")) {
      const aiResArray = aiResponseString.split("\n");
      aiResArray.shift();
      aiResArray.pop();
      aiResponseString = aiResArray.join("\n");
    }

    const aiResponse: AiResponse = JSON.parse(aiResponseString);
    const parsedResponse = aiResponseSchema.safeParse(aiResponse);
    if (!parsedResponse.success) return null;

    const { type, output } = parsedResponse.data;

    let result: string | null = null;

    if (type === "image") {
      result = output;
    } else if (type === "outsource") {
      const imageUrl = await getOverlayImageUrl(query);
      if (!imageUrl) return null;
      const imageBuffer = await downloadImageBuffer(imageUrl);
      result = await createMemeImage(query, "image", imageBuffer);
    } else if (type === "overlay") {
      const basePath = process.cwd();
      const overlayPath = path.join(basePath, "public", output);
      result = await createMemeImage(query, "image", overlayPath);
    } else if (type === "emoji") {
      result = await createMemeImage(query, "emoji", output);
    }

    if (result) {
      setTimeout(() => {
        storeInformation(query, output, ip, ref ?? "")
          .catch(error => console.error("Error storing information:", error));
      }, 0);
    }

    return result;
  } catch (error) {
    console.error("Error generating meme:", error);
    return null;
  }
};

async function downloadImageBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
  return Buffer.from(await response.arrayBuffer());
}

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
Remember user can use "bengali" or "hindi" language. When you need to use outsource type and query is in different language than english, convert it to english so that its easier to find out the image.
MAKE SURE TO USE "outsource" TYPE WHEN YOU ARE SIMPLY USING THE QUERY AS OUTPUT.
Here's the query: ${query}
`;

function IP() {
  const FALLBACK_IP_ADDRESS = "0.0.0.0";
  const forwardedFor = headers().get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0] ?? FALLBACK_IP_ADDRESS;
  }

  return headers().get("x-real-ip") ?? FALLBACK_IP_ADDRESS;
}
