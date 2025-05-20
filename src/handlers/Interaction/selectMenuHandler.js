// src/handlers/selectMenuHandler.js
import { replyError } from '../utils/replyHelpers.js';
// We no longer route date/time picks here—the picker service’s collector handles them
import datePickerHandler from './datePickerHandler.js';
import timePickerHandler from './timePickerHandler.js';

export default {
  async handle(interaction) {
    // Only care about StringSelectMenu interactions here
    if (!interaction.isStringSelectMenu()) return;

    const id = interaction.customId;

    // ----- NEW: let the picker service’s collector handle these entirely -----
    if (id.startsWith('select_date_') || id.startsWith('select_time_')) {
      return;
    }
    // -------------------------------------------------------------------------

    try {
      // 1) Route other custom‐ID commands (if you had any)
      const command = interaction.client.commands.get(id);
      if (command) {
        return command.execute(interaction);
      }

      // 2) No handler found
      return replyError(interaction, 'error.handler_not_found', {
        type: id
      });
    } catch (err) {
      console.error(`SelectMenuHandler error: ${err.message}`);
      return replyError(interaction, 'error.generic');
    }
  }
};
