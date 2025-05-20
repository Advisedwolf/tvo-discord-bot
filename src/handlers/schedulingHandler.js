// src/handlers/schedulingHandler.js
import cron from 'node-cron';
import logger from '../utils/logger.js';
import reminderService from '../services/Scheduler/reminderService.js';
import assetService from '../services/Admin/assetService.js';

/**
 * Initialize scheduled tasks: reminder polling and daily asset sync.
 */
export function initScheduling(client) {
  client.once('ready', () => {
    // Poll for due reminders every minute
    setInterval(() => {
      reminderService.pollDue(client).catch(err =>
        logger.error('[schedulingHandler] pollDue error', err)
      );
    }, 60_000);

    // Daily at 03:00 UTC, sync assets for all guilds
    cron.schedule('0 3 * * *', async () => {
      for (const guild of client.guilds.cache.values()) {
        try {
          await assetService.syncGuild(guild);
          logger.info(
            `[schedulingHandler] ✅ Asset sync succeeded for guild ${guild.id}`
          );
        } catch (err) {
          logger.error('[schedulingHandler] ❌ asset sync error', err);
        }
      }
    });

    logger.info('[schedulingHandler] ℹ️ Scheduling tasks initialized');
  });
}
