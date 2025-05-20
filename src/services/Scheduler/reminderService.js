// src/services/Scheduler/reminderService.js
import logger from '../../utils/logger.js';

class ReminderService {
  constructor() {
    // You can initialize any state here (e.g. DB connection, in-memory store, etc.)
  }

  /**
   * Called on an interval to look for due reminders.
   */
  async pollDue() {
    // TODO: load due reminders from your DB and send them.
    logger.info('[ReminderService] pollDue called – no-op stub');
    // Return something or just resolve.
    return;
  }

  /**
   * Schedule a one-off reminder.
   * @param {{guildId: string, userId: string, channelId: string, category: string, message: string, date: Date}} opts
   * @returns {Promise<{_id: string}>}
   */
  async scheduleOneOff(opts) {
    // TODO: insert into your Reminders collection and return the document
    logger.info(`[ReminderService] scheduleOneOff stub for ${opts.userId} at ${opts.date.toISOString()}`);
    return { _id: 'stub-id' };
  }
}

export default new ReminderService();
