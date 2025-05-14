
// src/cleanup/shields.js
const ShieldModel = require('../models/Shield');
const logger = require('../utils/logger');

async function cleanupShields(client) {
  const now = new Date();

  try {
    const activeShields = await ShieldModel.find({ expired: false });

    for (const shield of activeShields) {
      if (!shield.endTime) continue;

      const timeRemaining = new Date(shield.endTime) - now;

      // Send 15-minute warning if applicable
      if (timeRemaining < 15 * 60 * 1000 && !shield.warned) {
        try {
          const user = await client.users.fetch(shield.playerId);
          await user.send('⏰ Your shield ends in 15 minutes!');
          shield.warned = true;
        } catch (err) {
          logger.warn(`Could not DM shield warning to ${shield.playerId}: ${err.message}`, 'shields');
        }
      }

      // Handle expiry
      if (timeRemaining <= 0) {
        try {
          const channel = await client.channels.fetch(shield.channelId);
          const msg = await channel.messages.fetch(shield.messageId);
          await msg.edit({ content: '🛡️ Shield expired.', components: [] });
        } catch (err) {
          logger.warn(`Failed to edit expired shield post: ${err.message}`, 'shields');
        }

        shield.expired = true;
        await shield.save();
        logger.info(`Shield expired: ${shield.playerId}`, 'shields');
      }
    }
  } catch (err) {
    logger.error(`Shield cleanup failed: ${err.message}`, 'shields');
  }
}

module.exports = { cleanupShields };
