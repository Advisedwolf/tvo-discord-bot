// src/services/eventCleanupService.js
// Service to periodically clean up expired event posts

const cron = require('node-cron');
const EventModel = require('../models/Event');
const logger = require('../utils/logger');
const translator = require('../utils/translator');

/**
 * Schedules a cron job to remove expired event posts from Discord and database
 * @param {import('discord.js').Client} client
 */
function scheduleEventPostCleanup(client) {
  const cronPattern = process.env.EVENT_CLEANUP_CRON || '0 * * * *'; // default: top of every hour

  cron.schedule(cronPattern, async () => {
    const locale = 'en'; // system-level logs, locale may be static or configurable
    logger.info(translator.t('event.cleanup.check', locale), 'events');

    try {
      const now = new Date();
      const expiredEvents = await EventModel.find({
        end: { $lt: now },
        'posts.start': { $exists: true, $ne: '' }
      });

      for (const event of expiredEvents) {
        try {
          const channel = await client.channels.fetch(event.posts.startChannel);
          const message = await channel.messages.fetch(event.posts.start);
          await message.delete();

          logger.info(
            translator.t('event.cleanup.deleted', locale, { title: event.title }),
            'events'
          );

          event.posts.start = '';
          event.posts.startChannel = '';
          await event.save();
        } catch (err) {
          logger.warn(
            translator.t('event.cleanup.failedDelete', locale, { title: event.title, error: err.message }),
            'events'
          );
        }
      }
    } catch (err) {
      logger.error(
        translator.t('event.cleanup.error', locale, { error: err.message }),
        'events'
      );
    }
  });
}

module.exports = { scheduleEventPostCleanup };
