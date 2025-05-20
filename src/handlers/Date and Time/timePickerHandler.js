// src/handlers/timePickerHandler.js
import inputService from '../services/functions/inputService.js';
import { t } from '../utils/translator.js';
import reminderService from '../services/Scheduler/reminderService.js';
import { DateTime } from 'luxon';
import { state as datePickerState } from './datePickerHandler.js';

export default {
  /**
   * Handle the time‐picker select menus (hour, minute).
   * After minute selection, schedule the reminder.
   */
  async handle(interaction) {
    const [, , field] = interaction.customId.split('_'); // ['select','time','hour'] or ['select','time','minute']
    const userId = interaction.user.id;

    // Retrieve state built by datePickerHandler
    const userState = datePickerState.get(userId);
    if (!userState) {
      return interaction.update({
        content: t('ERRORS.generic'),
        components: []
      });
    }

    // Save hour or minute
    userState[field] = Number(interaction.values[0]);
    datePickerState.set(userId, userState);

    if (field === 'hour') {
      // Show minute selector only
      const minuteRow = inputService.getTimeSelectors()[1];
      return interaction.update({
        content: t('COMMANDS.remind.pickMinute'),
        components: [minuteRow]
      });
    }

    if (field === 'minute') {
      // All parts chosen: year, month, day, hour, minute
      const { year, month, day, hour, minute, category, message } = userState;
      // Build UTC datetime
      const dtUTC = DateTime.utc(year, month, day, hour, minute);

      // Schedule the reminder
      const reminder = await reminderService.scheduleOneOff({
        guildId: interaction.guild.id,
        userId,
        channelId: interaction.channelId,
        category,
        message,
        date: dtUTC.toJSDate()
      });

      // Clear state
      datePickerState.delete(userId);

      // Confirm to the user
      return interaction.update({
        content: t('COMMANDS.remind.successDescription', {
          id: reminder._id,
          time: dtUTC.setZone(interaction.user.locale || 'UTC')
            .toLocaleString(DateTime.DATETIME_FULL)
        }),
        components: []
      });
    }

    // Fallback
    return interaction.update({
      content: t('ERRORS.generic'),
      components: []
    });
  }
};
