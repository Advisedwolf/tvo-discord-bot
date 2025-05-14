// src/events/ready.js
const logger = require('../utils/logger');
const { scheduleEventPostCleanup } = require('../services/scheduleEventPostCleanup');
const initCleanupScheduler = require('./schedulers/cleanupScheduler');


module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    logger.info(`TVO-helper-Bot is online as ${client.user.tag}`, 'system');
    scheduleEventPostCleanup(client);
    initCleanupScheduler(client);
  },
};
