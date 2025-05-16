// src/services/functions/embeds/announcement.js
import { EmbedBuilder } from "discord.js";
import { icons } from "../../../config/assets.js";

export default function announcementTemplate(options = {}) {
  const {
    title = "📢 Announcement",
    description = "",
    fields = [],
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  } = options;

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(0xe67e22) // orange accent
    .setThumbnail(icons.announcement) // or a megaphone icon if you add one
    .setTimestamp();

  if (fields.length) embed.addFields(fields);

  embed.addFields({ name: "\u200B", value: id, inline: false });
  return embed;
}
