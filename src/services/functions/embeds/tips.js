// src/services/functions/embeds/tips.js
import { EmbedBuilder } from "discord.js";
import { icons } from "../../../config/assets.js";

/**
 * Tips & Tricks‐style embed with teal accent and contextual fields.
 * @param {object} options
 * @param {string} options.title        — Tip title.
 * @param {string} [options.description]— The tip content.
 * @param {Array<{name:string,value:string,inline?:boolean}>} [options.fields]
 *                                        — Extra notes or links.
 * @param {string} [options.id]         — Hidden tracking ID.
 */
export default function tipsTemplate(options = {}) {
  const {
    title = "💡 Tip & Trick",
    description = "",
    fields = [],
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  } = options;

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(0x1abc9c) // teal accent
    .setThumbnail(icons.tips) // your tips icon
    .setTimestamp();

  if (fields.length) embed.addFields(fields);

  // hidden ID
  embed.addFields({ name: "\u200B", value: id, inline: false });

  return embed;
}
