// src/services/discordEventSync.js
const logger = require('../utils/logger');
const translator = require('../utils/translator');

/**
 * Syncs a MongoDB event to a Discord guild scheduled event.
 * @param {Object} event - Event object from MongoDB containing discordEventId, title, description, start, end.
 * @param {Client} client - Discord.js client instance
 */
async function updateDiscordEvent(event, client) {
  try {
    // Fetch the guild
    const guild = await client.guilds.fetch(process.env.GUILD_ID);

    // Fetch the existing scheduled event
    const scheduledEvent = await guild.scheduledEvents.fetch(event.discordEventId);
    if (!scheduledEvent) throw new Error(
      translator.t('event.sync.notFound', { id: event.discordEventId })
    );

    // Edit the scheduled event details
    const updated = await scheduledEvent.edit({
      name: event.title,
      description: event.description,
      scheduledStartTime: new Date(event.start),
      scheduledEndTime: new Date(event.end)
    });

    // Log successful sync
    logger.info(
      translator.t('event.sync.updated', { name: updated.name }),
      'events'
    );
  } catch (error) {
    // Log failure with translated message
    logger.error(
      translator.t('event.sync.failed', { error: error.message }),
      'events'
    );
  }
}

module.exports = { updateDiscordEvent };
