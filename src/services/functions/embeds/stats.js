// src/services/functions/embeds/stats.js
import { EmbedBuilder } from 'discord.js';
import { icons } from '../../../config/assets.js';

/**
 * Stats‐style embed with green accent, fields for numeric data,
 * hidden tracking ID, and optional overall description.
 *
 * @param {object} options
 * @param {string} [options.title]        — Embed title (e.g., “Server Stats”).
 * @param {string} [options.description]  — Optional summary or subtitle.
 * @param {Array<{name:string,value:string,inline?:boolean}>} [options.fields]
 *                                   — Numeric or summary stats (e.g., user count, uptime).
 * @param {string} [options.id]           — Optional override for tracking ID.
 */
export default function statsTemplate(options = {}) {
  const {
    title = '📊 Statistics',
    description = '',
    fields = [],
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  } = options;

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(0x2ecc71) // a fresh green (#2ECC71)
    .setThumbnail(icons.stats) // your stats/chart icon from assets.js
    .setTimestamp();

  // Add the stat fields
  if (fields.length) embed.addFields(fields);

  // Hidden tracking‐ID field (zero-width name)
  embed.addFields({
    name: '\u200B',
    value: id,
    inline: false,
  });

  return embed;
}
