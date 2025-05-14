
// src/schedulers/cleanupScheduler.js
const cron = require('node-cron');
const { cleanupExpiredEvents } = require('../cleanup/events');
const { cleanupShields } = require('../cleanup/shields');
const logger = require('../utils/logger');

module.exports = function initCleanupScheduler(client) {
  logger.info('🧹 Cleanup scheduler started, running every 15 minutes', 'scheduler');
  cron.schedule('*/15 * * * *', async () => {
    logger.debug('🔁 Running cleanup tasks...', 'scheduler');
    await cleanupExpiredEvents(client);
    await cleanupShields(client);
  });
};
