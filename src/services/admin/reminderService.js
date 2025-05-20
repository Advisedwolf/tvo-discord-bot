// src/services/Scheduler/reminderService.js
import Reminder from '../../models/Reminder.js';
import logger from '../../utils/logger.js';
import { t } from '../../utils/translator.js';

class ReminderService {
  constructor() {
    this.client = null;
    this.pollInterval = 60 * 1000; // check every minute
    this.timer = null;
  }

  /**
   * Attach the Discord client instance for sending messages
   * @param {import('discord.js').Client} client
   */
  setClient(client) {
    this.client = client;
  }

  /**
   * Start polling for due reminders
   */
  async start() {
    if (!this.client) throw new Error('ReminderService: Discord client not set');
    this.timer = setInterval(() => this.checkDueReminders(), this.pollInterval);
    logger.info('ReminderService: started polling for due reminders');
  }

  /**
   * Stop polling
   */
  stop() {
    if (this.timer) clearInterval(this.timer);
  }

  /**
   * Fetch and trigger all reminders that are due
   */
  async checkDueReminders() {
    try {
      const now = new Date();
      const due = await Reminder.find({ remindAt: { $lte: now }, triggered: false }).lean();
      for (const r of due) {
        this._triggerReminder(r);
      }
    } catch (err) {
      logger.error(`ReminderService: error checking reminders: ${err.message}`);
    }
  }

  /**
   * Handle firing a single reminder
   * @private
   */
  async _triggerReminder(reminder) {
    try {
      const { channelId, userId, category, message, isRecurring, recurrence } = reminder;
      const payload = {
        content: `🔔 [${t(`CATEGORIES.${category}`, { default: category })}] ${message}`
      };

      // Attempt to send in channel if provided
      if (channelId) {
        try {
          const channel = await this.client.channels.fetch(channelId);
          await channel.send(payload);
        } catch (err) {
          // If missing access or permissions, fallback to DM
          const code = err.code || (err.rawError && err.rawError.code);
          if (code === 50013 || err.message.includes('Missing Access')) {
            logger.warn(`ReminderService: missing access to channel ${channelId}, DM’ing user ${userId}`);
            const user = await this.client.users.fetch(userId);
            await user.send({
              content: `🔔 [${t(`CATEGORIES.${category}`, { default: category })}] ${message}\n*(I couldn’t post in the channel, so I DM’d you instead.)*`
            });
          } else {
            throw err;
          }
        }
      } else {
        // No channel specified → DM user directly
        const user = await this.client.users.fetch(userId);
        await user.send(payload);
      }

      // Mark as triggered for one-off reminders
      await Reminder.updateOne(
        { _id: reminder._id },
        { $set: { triggered: !isRecurring } }
      );

      // Reschedule if recurring
      if (isRecurring && recurrence) {
        // Placeholder: add 1 day (swap in proper cron/rrule logic as needed)
        const nextDate = DateTime.fromJSDate(reminder.remindAt)
          .plus({ days: 1 })
          .toJSDate();
        await Reminder.updateOne(
          { _id: reminder._id },
          { $set: { remindAt: nextDate, triggered: false } }
        );
      }
    } catch (err) {
      logger.error(`ReminderService: error triggering reminder ${reminder._id}: ${err.message}`);
    }
  }

  /**
   * Schedule a one-off reminder
   * @param {object} params
   * @param {string} params.guildId
   * @param {string} params.userId
   * @param {string|null} params.channelId
   * @param {string} params.category
   * @param {string} params.message
   * @param {Date}   params.date       // JS Date in UTC
   */
  async scheduleOneOff({ guildId, userId, channelId, category, message, date }) {
    const r = await Reminder.create({
      guildId,
      userId,
      channelId,
      category,
      message,
      remindAt: date
    });
    return r;
  }

  /**
   * Cancel a reminder by ID for a given user
   */
  async cancelReminder(reminderId, userId) {
    const res = await Reminder.deleteOne({ _id: reminderId, userId });
    return res.deletedCount;
  }

  /**
   * List upcoming reminders for a user in a guild
   */
  async listReminders(guildId, userId) {
    return Reminder.find({ guildId, userId, triggered: false }).lean();
  }
}

export default new ReminderService();
