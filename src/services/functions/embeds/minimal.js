// src/services/functions/embeds/minimal.js
import { EmbedBuilder } from "discord.js";
import { icons } from "../../../config/assets.js";

/**
 * Minimalist embed with hidden tracking ID and optional fields.
 * Ideal for simple notifications or "bare" posts.
 *
 * @param {object} options
 * @param {string} options.title        — Embed title.
 * @param {string} [options.description]— Optional body text.
 * @param {Array<{name:string,value:string,inline?:boolean}>} [options.fields]
 *                                   — Any extra details to show.
 * @param {string} [options.id]         — Optional override for tracking ID.
 */
export default function minimalTemplate(options = {}) {
  const {
    title = "",
    description = "",
    fields = [],
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  } = options;

  const embed = new EmbedBuilder()
    // No accent color by default—faint gray border
    .setColor(0x95a5a6) // light gray
    .setTitle(title)
    .setDescription(description)
    .setThumbnail(icons.minimal) // your minimalist dash icon
    .setTimestamp();

  // Add fields if provided
  if (fields.length) embed.addFields(fields);

  // Hidden tracking‐ID field
  embed.addFields({
    name: "\u200B",
    value: id,
    inline: false,
  });

  return embed;
}
