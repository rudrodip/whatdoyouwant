"use server";

import sharp from "sharp";
import path from "path";

const MEME_WIDTH = 1010;
const MEME_HEIGHT = 730;

export const createMemeImage = async (
  query: string,
  overlayType: "emoji" | "image",
  overlayContent: string
): Promise<string | null> => {
  try {
    const baseImagePath = path.join(process.cwd(), "public", "base.png");

    const textSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${MEME_WIDTH}" height="${MEME_HEIGHT}">
        <text x="${
          MEME_WIDTH / 2
        }" y="80" font-size="60" font-weight="bold" fill="black" text-anchor="middle">
          <tspan x="${MEME_WIDTH / 2}" dy="0">Yeh lo tumhare liye</tspan>
          <tspan x="${MEME_WIDTH / 2}" dy="55">${query
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")}</tspan>
          <tspan x="${MEME_WIDTH / 2}" dy="55">le aya hun</tspan>
        </text>
      </svg>
    `;

    const composites = [];

    if (overlayType === "emoji") {
      composites.push({
        input: {
          text: {
            text: overlayContent,
            font: "sans-serif",
            rgba: true,
            width: 180,
            dpi: 1200,
          },
        },
        gravity: "north",
        top: 468,
        left: 627,
      });
    } else if (overlayType === "image") {
      const overlayBuffer = await sharp(overlayContent)
        .resize(180, 180)
        .toBuffer();
      composites.push({
        input: overlayBuffer,
        top: 468,
        left: 627,
      });
    }
    composites.push({
      input: Buffer.from(textSvg),
      top: 0,
      left: 0,
    });
    const memeBuffer = await sharp(baseImagePath)
      .composite(composites)
      .toBuffer();

    return `data:image/png;base64,${memeBuffer.toString("base64")}`;
  } catch (error) {
    console.error("Error creating meme image:", error);
    return null;
  }
};
