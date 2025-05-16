// src/services/functions/embeds/error.js
import { EmbedBuilder } from "discord.js";
import { icons } from "../../../config/assets.js";

/**
 * Error‐style embed with hidden tracking ID and contextual fields.
 * @param {object} options
 * @param {string} options.title        — Embed title.
 * @param {string} options.description  — Main body text (error message).
 * @param {Array<{name:string,value:string,inline?:boolean}>} [options.fields]
 *                                   — Any extra details to show.
 * @param {string} [options.id]         — Optional override for tracking ID.
 */
export default function errorTemplate(options = {}) {
  const {
    title = "❌ Error",
    description = "An unexpected error occurred.",
    fields = [],
    // Generate a simple unique ID if none provided:
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  } = options;

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(0xe74c3c) // a rich red (#E74C3C)
    .setThumbnail(icons.error) // your red “!” icon
    .setTimestamp();

  // Add any contextual fields
  if (fields.length) embed.addFields(fields);

  // Hidden tracking‐ID field (zero‐width name)
  embed.addFields({
    name: "\u200B",
    value: id,
    inline: false,
  });

  return embed;
}
