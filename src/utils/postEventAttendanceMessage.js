
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const moment = require('moment-timezone');
const { t } = require('../utils/translator');
const logger = require('../utils/logger');
const EventModel = require('../models/Event');
const EVENTS_CONFIG = require('../../config/events.json');

const ATTEND_CHANNEL_ID = '1371640448162070718';

async function postEventAttendanceMessage(event, client) {
  try {
    const config = EVENTS_CONFIG[event.key];
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const channel = await guild.channels.fetch(ATTEND_CHANNEL_ID);

    const unix = Math.floor(new Date(event.start).getTime() / 1000);

    const embed = new EmbedBuilder()
      .setTitle(event.title)
      .setDescription(t(config.description, 'en')) // Default to English for now
      .addFields(
        { name: '📅 Starts At (UTC)', value: `<t:${unix}:F>`, inline: true },
        { name: '⏳ Countdown', value: `<t:${unix}:R>`, inline: true }
      )
      .setThumbnail(config.image || null)
      .setColor(0x4DB6E2)
      .setFooter({ text: 'Click a button below to confirm your attendance.' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`attend:yes:${event._id}`)
        .setLabel('✅ Interested')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`attend:no:${event._id}`)
        .setLabel('❌ Not Attending')
        .setStyle(ButtonStyle.Secondary)
    );

    const msg = await channel.send({ embeds: [embed], components: [row] });

    // Auto-create thread for discussion
    await msg.startThread({
      name: `🗓️ Event: ${event.title}`,
      autoArchiveDuration: 1440,
      reason: 'Auto thread for event attendance'
    });

    event.posts.start = msg.id;
    event.posts.startChannel = channel.id;
    await event.save();
    logger.info(`Posted event and countdown: ${event.title}`, 'events');

  } catch (err) {
    logger.error(`Error in postEventAttendanceMessage: ${err.message}`, 'events');
  }
}

module.exports = { postEventAttendanceMessage };
