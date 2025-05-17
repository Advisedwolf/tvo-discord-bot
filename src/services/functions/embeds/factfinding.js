// src/services/functions/embeds/factfinding.js
import { EmbedBuilder } from 'discord.js';
import { icons } from '../../../config/assets.js';

/**
 * Fact‐Finding embed with amber accent and contextual fields.
 * @param {object} options
 * @param {string} options.title        — Fact headline.
 * @param {string} [options.description]— Fact details or summary.
 * @param {Array<{name:string,value:string,inline?:boolean}>} [options.fields]
 *                                        — Source links, citations, data points.
 * @param {string} [options.id]         — Hidden tracking ID.
 */
export default function factfindingTemplate(options = {}) {
  const {
    title = '🔍 Fact Finding',
    description = '',
    fields = [],
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  } = options;

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(0xf39c12) // amber accent
    .setThumbnail(icons.fact) // your fact‐finding icon
    .setTimestamp();

  if (fields.length) embed.addFields(fields);

  // hidden ID
  embed.addFields({ name: '\u200B', value: id, inline: false });

  return embed;
}
