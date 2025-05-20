// src/services/functions/dateTimePickerService.js
import { ComponentType } from 'discord.js';
import inputService from './inputService.js';
//import { DateTime } from 'luxon';
import { t } from '../../utils/translator.js';

class DateTimePickerService {
  /**
   * Send an ephemeral date/time picker flow, then resolve with the chosen UTC Date.
   *
   * @param {CommandInteraction} interaction
   * @param {object} options
   * @param {string} options.prompt        — initial prompt text
   * @param {Date}   [options.defaultDate]— date to pre-select (defaults to now)
   * @returns {Promise<Date>}              — the chosen Date in UTC
   */
  async pickDateTime(interaction, { prompt, defaultDate = new Date() }) {
    // Defer if needed
    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferReply({ flags: 64 });
    }

    // Build selectors: returns [yearRow, monthRow, dayRowLow, dayRowHigh]
    const [yearRow, monthRow, dayRowLow, dayRowHigh] = 
      inputService.getDateSelectors(defaultDate);

    // Send initial year selector
    const reply = await interaction.editReply({
      content: prompt,
      components: [yearRow]
    });

    // State for this flow
    const state = { year: null, month: null, day: null, hour: null, minute: null };

    // Collector for all select menus on this reply
    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 120_000, // 2 minutes
    });

    return new Promise((resolve, reject) => {
      collector.on('collect', async (selectInteraction) => {
        const id = selectInteraction.customId;
        const value = Number(selectInteraction.values[0]);

        try {
          // 1) YEAR picked
          if (id === 'select_date_year') {
            state.year = value;
            return selectInteraction.update({
              content: t('COMMANDS.remind.pickMonth'),
              components: [monthRow]
            });
          }

          // 2) MONTH picked
          if (id === 'select_date_month') {
            state.month = value;
            // present both low and high day rows
            return selectInteraction.update({
              content: t('COMMANDS.remind.pickDay'),
              components: [dayRowLow, dayRowHigh]
            });
          }

          // 3) DAY picked (could be low or high)
          if (id === 'select_date_day_low' || id === 'select_date_day_high') {
            state.day = value;
            // now show hour selector
            const [hourRow, minuteRow] = inputService.getTimeSelectors(defaultDate);
            return selectInteraction.update({
              content: t('COMMANDS.remind.pickHour'),
              components: [hourRow]
            });
          }

          // 4) HOUR picked
          if (id === 'select_time_hour') {
            state.hour = value;
            const [hourRow, minuteRow] = inputService.getTimeSelectors(defaultDate);
            return selectInteraction.update({
              content: t('COMMANDS.remind.pickMinute'),
              components: [minuteRow]
            });
          }

          // 5) MINUTE picked → finalize
          if (id === 'select_time_minute') {
            state.minute = value;

            // Stop collecting further interactions
            collector.stop();

            // Build the UTC Date
            const dt = DateTime.utc(
              state.year,
              state.month,
              state.day,
              state.hour,
              state.minute
            );

            // Clear the components and resolve
            await selectInteraction.update({ components: [] });
            resolve(dt.toJSDate());
          }
        } catch (err) {
          // Any error during update should reject
          collector.stop();
          reject(err);
        }
      });

      collector.on('end', (collected, reason) => {
        if (reason === 'time') {
          reject(new Error('Date/time picker timed out'));
        }
      });
    });
  }
}

export default new DateTimePickerService();

