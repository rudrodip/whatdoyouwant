import { NextResponse } from "next/server";
import sharp from "sharp";
import path from "path";
import { formSchema } from "@/lib/schema";

const MEME_WIDTH = 1010;
const MEME_HEIGHT = 730;

export async function POST(request: Request) {
  const body = await request.json();
  const parsedData = formSchema.safeParse(body);
  if (!parsedData.success)
    return NextResponse.json({ error: parsedData.error }, { status: 400 });

  const query = parsedData.data.query;
  const baseImagePath = path.join(process.cwd(), "public", "base.png");
  const overlayImagePath = path.join(
    process.cwd(),
    "public",
    "favicon-192x192.png"
  );

  try {
    const resizedOverlay = await sharp(overlayImagePath)
      .resize(180, 180)
      .toBuffer();

    const textSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${MEME_WIDTH}" height="${MEME_HEIGHT}">
        <text x="${MEME_WIDTH / 2}" y="80" font-family="Impact, sans-serif" font-size="60" font-weight="bold" fill="black" text-anchor="middle">
          <tspan x="${MEME_WIDTH / 2}" dy="0">Yeh lo tumhare liye</tspan>
          <tspan x="${MEME_WIDTH / 2}" dy="55">${query
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")}</tspan>
          <tspan x="${MEME_WIDTH / 2}" dy="55">le aya hun</tspan>
        </text>
      </svg>
    `;

    const memeBuffer = await sharp(baseImagePath)
      .composite([
        {
          input: resizedOverlay,
          top: 468,
          left: 627,
        },
        {
          input: Buffer.from(textSvg),
          top: 0,
          left: 0,
        },
      ])
      .toBuffer();

    const base64Image = `data:image/png;base64,${memeBuffer.toString(
      "base64"
    )}`;

    return NextResponse.json({ memeUrl: base64Image });
  } catch (error) {
    console.error("Error generating meme:", error);
    return NextResponse.json(
      { error: "Failed to generate meme" },
      { status: 500 }
    );
  }
}
