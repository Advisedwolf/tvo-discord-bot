// src/services/functions/embeds/video.js
import { EmbedBuilder } from "discord.js";
import { icons } from "../../../config/assets.js";

/**
 * Video‐style embed for tutorials or clips.
 * @param {object} options
 * @param {string} options.title       — Video title.
 * @param {string} options.url         — Video URL (YouTube, Vimeo, etc.).
 * @param {string} [options.description] — Short summary or timestamp details.
 * @param {string} [options.image]     — Preview image URL (video thumbnail).
 * @param {Array<{name:string,value:string,inline?:boolean}>} [options.fields]
 *                                    — Any extra info (e.g. duration).
 * @param {string} [options.id]        — Hidden tracking ID.
 */
export default function videoTemplate(options = {}) {
  const {
    title,
    url,
    description = "",
    image = null,
    fields = [],
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  } = options;

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setURL(url)
    .setDescription(description)
    .setColor(0xff0000) // YouTube‐red
    // If caller provided an image, attach it
    .setImage(image || null)
    .setThumbnail(icons.video) // or your “play” icon if you add one
    .setTimestamp();

  if (fields.length) embed.addFields(fields);

  // Hidden ID
  embed.addFields({ name: "\u200B", value: id, inline: false });

  return embed;
}
