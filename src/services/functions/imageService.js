// src/services/functions/imageService.js
import { IMGUR_CLIENT_ID } from "../../config/index.js";

/**
 * Uploads a Buffer or Base64 string to Imgur and returns the image URL.
 * @param {Buffer|string} imageData  — Buffer or base64-encoded string
 */
export async function uploadToImgur(imageData) {
  // Prepare payload as base64
  const payload =
    typeof imageData === "string"
      ? { image: imageData, type: "base64" }
      : { image: imageData.toString("base64"), type: "base64" };

  // Use global fetch (Node 18+). No node-fetch import needed.
  const res = await fetch("https://api.imgur.com/3/image", {
    method: "POST",
    headers: {
      Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const { data, success } = await res.json();
  if (!success) {
    const errMsg = data?.error || "Unknown Imgur error";
    throw new Error(`Imgur upload failed: ${errMsg}`);
  }

  return data.link; // public image URL
}
