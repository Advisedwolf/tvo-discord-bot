// src/services/functions/embeds/profile.js
import { EmbedBuilder } from "discord.js";
import { icons } from "../../../config/assets.js";

/**
 * Profile‐style embed with thumbnail avatar/icon, hidden tracking ID,
 * and contextual fields for user or entity metadata.
 *
 * @param {object} options
 * @param {string} options.title        — Embed title (e.g., username).
 * @param {string} [options.description]— Brief bio or status text.
 * @param {string} [options.thumbnail]  — URL for the profile image; defaults to icons.profile.
 * @param {Array<{name:string,value:string,inline?:boolean}>} [options.fields]
 *                                   — Profile details (e.g., ID, joined date).
 * @param {string} [options.id]         — Optional override for tracking ID.
 */
export default function profileTemplate(options = {}) {
  const {
    title = "Profile",
    description = "",
    thumbnail = icons.profile,
    fields = [],
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  } = options;

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(0x9b59b6) // a purple accent (#9B59B6)
    .setThumbnail(thumbnail) // user avatar or default profile icon
    .setTimestamp();

  // Add any profile fields
  if (fields.length) embed.addFields(fields);

  // Hidden tracking‐ID field (zero-width name)
  embed.addFields({
    name: "\u200B",
    value: id,
    inline: false,
  });

  return embed;
}
