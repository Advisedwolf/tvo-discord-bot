const schedule = require('node-schedule');
const logger = require('../utils/logger');
const { fetchUpcomingEvents, sendReminders } = require('../services/eventScheduler');

module.exports = function startEventReminderScheduler() {
  schedule.scheduleJob('*/30 * * * *', async () => {
    logger.debug('Running event reminder check...', 'scheduler');
    const events = await fetchUpcomingEvents();
    await sendReminders(events);
  });
};
