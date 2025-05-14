// src/services/eventEmbedSync.js
const { EmbedBuilder } = require('discord.js');
const logger = require('../utils/logger');
const translator = require('../utils/translator');

/**
 * Syncs a saved event to its Discord embed post.
 * @param {Object} event - Event document with posts.summary, title, description, start, end
 * @param {Client} client - Discord.js client instance
 */
async function updateEventEmbedPost(event, client) {
  const locale = 'en'; // Locale is static for service-level messages

  try {
    if (!event.posts?.summary) return;

    const channel = await client.channels.fetch(process.env.EVENT_ANNOUNCE_CHANNEL_ID);
    const message = await channel.messages.fetch(event.posts.summary);
    if (!message) throw new Error(
      translator.t('event.embed.notFound', locale, { id: event.posts.summary })
    );

    const embed = new EmbedBuilder()
      .setTitle(event.title)
      .setDescription(event.description)
      .addFields(
        {
          name: translator.t('event.embed.fieldStart', locale),
          value: `<t:${Math.floor(new Date(event.start).getTime() / 1000)}:F>`,
          inline: true
        },
        {
          name: translator.t('event.embed.fieldEnd', locale),
          value: `<t:${Math.floor(new Date(event.end).getTime() / 1000)}:F>`,
          inline: true
        }
      )
      .setTimestamp();

    await message.edit({ embeds: [embed] });
    logger.info(
      translator.t('event.embed.logUpdated', locale, { title: event.title }),
      'events'
    );
  } catch (err) {
    logger.error(
      translator.t('event.embed.logError', locale, { error: err.message }),
      'events'
    );
  }
}

module.exports = { updateEventEmbedPost };

