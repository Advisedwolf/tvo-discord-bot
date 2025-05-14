
// src/cleanup/events.js
const EventModel = require('../models/Event');
const logger = require('../utils/logger');

async function cleanupExpiredEvents(client) {
  try {
    const now = new Date();
    const expiredEvents = await EventModel.find({
      end: { $lt: now },
      'posts.summary': { $exists: true }
    });

    for (const event of expiredEvents) {
      try {
        const channel = await client.channels.fetch(process.env.EVENT_ANNOUNCE_CHANNEL_ID);
        const message = await channel.messages.fetch(event.posts.summary);
        await message.delete();
        logger.info(`🗑 Deleted expired event embed: ${event.title}`, 'cleanup');
      } catch (err) {
        logger.warn(`⚠️ Could not delete event post for ${event.title}: ${err.message}`, 'cleanup');
      }
    }
  } catch (err) {
    logger.error(`Failed to run expired event cleanup: ${err.message}`, 'cleanup');
  }
}

module.exports = { cleanupExpiredEvents };
