// src/services/functions/embeds/question.js
import { EmbedBuilder } from "discord.js";
import { icons } from "../../../config/assets.js";

/**
 * Question‐style embed with navy accent and contextual fields.
 * @param {object} options
 * @param {string} options.title        — Question title.
 * @param {string} [options.description]— The question body/details.
 * @param {Array<{name:string,value:string,inline?:boolean}>} [options.fields]
 *                                        — Additional context or choices.
 * @param {string} [options.id]         — Hidden tracking ID.
 */
export default function questionTemplate(options = {}) {
  const {
    title = "❓ Question",
    description = "",
    fields = [],
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  } = options;

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(0x34495e) // navy accent
    .setThumbnail(icons.question) // your question icon
    .setTimestamp();

  if (fields.length) embed.addFields(fields);

  // hidden ID
  embed.addFields({ name: "\u200B", value: id, inline: false });

  return embed;
}
