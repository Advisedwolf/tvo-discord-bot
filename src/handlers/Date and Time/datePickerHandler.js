// src/handlers/datePickerHandler.js
import inputService from '../services/functions/inputService.js';
import { t } from '../utils/translator.js';

export const state = new Map();

export default {
  state,

  /**
   * Handle the date‐picker select menus (year, month, day).
   * Transitions the user through each step via interaction.update().
   */
  async handle(interaction) {
    // customId format: 'select_date_<field>', e.g. 'select_date_year'
    const [, , field] = interaction.customId.split('_');
    const userId = interaction.user.id;

    // Retrieve or initialize partial state for this user
    const userState = state.get(userId) || {};
    userState[field] = Number(interaction.values[0]);
    state.set(userId, userState);

    // Sequence to the next picker
    if (field === 'year') {
      // Show month selector only
      const monthRow = inputService.getDateSelectors()[1];
      return interaction.update({
        content: t('COMMANDS.remind.pickMonth'),
        components: [monthRow]
      });
    }

    if (field === 'month') {
      // Show day selector only
      const dayRow = inputService.getDateSelectors()[2];
      return interaction.update({
        content: t('COMMANDS.remind.pickDay'),
        components: [dayRow]
      });
    }

    if (field === 'day') {
      // All date parts chosen—move to time picker (hour)
      const hourRow = inputService.getTimeSelectors()[0];
      return interaction.update({
        content: t('COMMANDS.remind.pickHour'),
        components: [hourRow]
      });
    }

    // Fallback (shouldn't happen)
    return interaction.update({
      content: t('ERRORS.generic'),
      components: []
    });
  }
};
