// src/services/functions/embeds/info.js
import { EmbedBuilder } from "discord.js";
import { icons } from "../../../config/assets.js";

/**
 * Info‐style embed with hidden tracking ID and contextual fields.
 * @param {object} options
 * @param {string} options.title        — Embed title.
 * @param {string} options.description  — Main body text.
 * @param {Array<{name:string,value:string,inline?:boolean}>} [options.fields]
 *                                   — Any extra fields to show.
 * @param {string} [options.id]         — Optional override for tracking ID.
 */
export default function infoTemplate(options = {}) {
  const {
    title = "ℹ️ Information",
    description = "",
    fields = [],
    // Generate a simple unique ID if none provided:
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  } = options;

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(0x3498db)
    .setThumbnail(icons.info)
    .setTimestamp();

  // Add any contextual fields
  if (fields.length) embed.addFields(fields);

  // Hidden tracking-ID field (zero-width name)
  embed.addFields({
    name: "\u200B",
    value: id,
    inline: false,
  });

  return embed;
}
