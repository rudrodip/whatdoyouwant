"use server";

import { createApi } from "unsplash-js";

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY!,
});

export const getOverlayImageUrl = async (
  query: string
): Promise<string | null> => {
  try {
    const response = await unsplash.search.getPhotos({
      query,
      perPage: 1,
    });

    if (response.errors) return null;
    return response.response.results[0].urls.thumb;
  } catch (error) {
    console.error("Error fetching image from Unsplash:", error);
    return null;
  }
};
