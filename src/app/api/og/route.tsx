import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createApi } from "unsplash-js";

export const runtime = "edge";
export const alt = "What do you want?";
export const size = {
  width: 1010,
  height: 730,
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY!,
});

const aiResponseSchema = z.object({
  type: z.enum(["emoji", "image", "outsource", "direct_image"]),
  output: z.string(),
});

type AiResponse = z.infer<typeof aiResponseSchema>;
export const contentType = "image/png";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query") || "cat";
  const font = fetch(
    new URL("../../../../assets/fonts/impact.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  const sentence = `Yeh lo tumhare liye ${query} leke aya hu`;
  const prompt = generatePrompt(query);
  let result = (await model.generateContent(prompt)).response.text();
  if (result.includes("`")) {
    const aiResArray = result.split("\n");
    aiResArray.shift();
    aiResArray.pop();
    result = aiResArray.join("\n");
  }
  const aiResponse: AiResponse = JSON.parse(result);
  const parsedResponse = aiResponseSchema.safeParse(aiResponse);
  if (!parsedResponse.success) return null;

  const { type, output } = parsedResponse.data;
  let imageUrl: string | null = null;
  if (type === "image") {
    imageUrl = output;
  } else if (type === "outsource") {
    imageUrl = await getOverlayImageUrl(output);
  } else if (type === "direct_image") {
    imageUrl = output;
    // send the raw image directly
    return fetch(imageUrl);
  }

  const outputElement = imageUrl ? (
    <img src={imageUrl} alt={output} width="100%" height="100%" />
  ) : (
    output
  );

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "#fff",
          fontSize: 80,
          fontWeight: 600,
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            zIndex: -100,
          }}
        >
          <img
            src="https://whatyouwant.rdsx.dev/base.png"
            alt="base"
            width="100%"
            height="100%"
          />
        </div>
        <div
          style={{
            textAlign: "center",
            zIndex: 1000,
            position: "absolute",
            maxWidth: "90%",
          }}
        >
          {sentence}
        </div>
        <div
          style={{
            position: "absolute",
            top: "468px",
            left: "627px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "180px",
            height: "180px",
            fontSize: 180,
          }}
        >
          {outputElement}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Inter",
          data: await font,
          style: "normal",
          weight: 400,
        },
      ],
    }
  );
}

const generatePrompt = (query: string) => `
I am making a meme website, and you're the core ai behind it. Your task is to generate good structured response for me. So, basically i ask users "what do you want?", and the user responds. based on the query, i show a meme. But there are some special cases.
Your output structure: { type: string output: string } json schema
There are three types: 1. emoji 2. image 3. outsource 4. direct_image

Here's the list of direct image you can use:
1. https://c.tenor.com/O69qbS-sDkUAAAAC/tenor.gif
2. https://whatyouwant.rdsx.dev/special-case/enemy-meme.jpeg
3. https://whatyouwant.rdsx.dev/special-case/foodie.jpeg

If anyone tries to flirt, like they respond with "you" or kiss or hug or similar romantic query, respond with the direct image "https://c.tenor.com/O69qbS-sDkUAAAAC/tenor.gif"
If anyone tries to say something rude or cute or something villain-ish like blood, similar, respond with the direct image "https://whatyouwant.rdsx.dev/special-case/enemy-meme.jpeg"
If anyone asks for heavy food, like pizza, burger or junkfood, respond with the direct image: "https://whatyouwant.rdsx.dev/special-case/foodie.jpeg"

Here're some special cases:
query - cat / kitten or similar, respond with any one of these images:
1. https://whatyouwant.rdsx.dev/special-case/cat.png
2. https://whatyouwant.rdsx.dev/special-case/cat-sleep.jpeg
3. https://whatyouwant.rdsx.dev/special-case/cat-smol.jpeg
4. https://whatyouwant.rdsx.dev/special-case/cat-upset.jpeg

If cute cat, or cute pet, or baby respond with this image: https://whatyouwant.rdsx.dev/special-case/pookie.jpeg

If anyone asks for cold coffee/iced coffee, respond with the image: https://whatyouwant.rdsx.dev/special-case/cold-coffee.png
For milkshake: https://whatyouwant.rdsx.dev/special-case/milkshake.jpg
For iphone: https://whatyouwant.rdsx.dev/special-case/iphone.png

And for other cases, try responding with a single emoji.

And if all the cases fails, just respond with outsource type, and query itself

Examples:
1. query: "cat", response: { type: "image", output: "https://whatyouwant.rdsx.dev/special-case/cat.png" }
2. query: "cute cat", response: { type: "image", output: "https://whatyouwant.rdsx.dev/special-case/pookie.jpeg" }
3. query: "cold coffee", response: { type: "image", output: "https://whatyouwant.rdsx.dev/special-case/cold-coffee.png" }
4. query: "iphone", response: { type: "image", output: "https://whatyouwant.rdsx.dev/special-case/iphone.png" }
5. query: "pizza", response: { type: "direct_image", output: "https://whatyouwant.rdsx.dev/special-case/foodie.jpeg" }
6. query: "you", response: { type: "direct_image", output: "https://c.tenor.com/O69qbS-sDkUAAAAC/tenor.gif" }
7. query: "laptop", response: { type: "emoji", output: "💻" }
8. query: "you're cute", response: { type: "direct_image", output: "https://c.tenor.com/O69qbS-sDkUAAAAC/tenor.gif" }
9. query: "enemy", response: { type: "direct_image", output: "https://whatyouwant.rdsx.dev/special-case/enemy-meme.jpeg" }
10. query: "tea", response: { type: "emoji", output: "🍵" }
11. query: "tree", response: { type: "outsource", output: "tree" }
12. query: "dog", response: { type: "outsource", output: "dog" }


Try your best to just use special cases, and emojis. if not then just use outsource type.
Remember user can use "bengali" or "hindi" language. When you need to use outsource type and query is in different language than english, convert it to english so that its easier to find out the image.
MAKE SURE TO USE "outsource" TYPE WHEN YOU ARE SIMPLY USING THE QUERY AS OUTPUT.
Here's the query: ${query}
`;

const getOverlayImageUrl = async (query: string): Promise<string | null> => {
  try {
    const response = await unsplash.search.getPhotos({
      query,
      perPage: 1,
    });
    if (response.errors) return null;
    if (response.response.results.length === 0) return null;
    return response.response.results[0].urls.thumb;
  } catch (error) {
    console.error("Error fetching image from Unsplash:", error);
    return null;
  }
};
