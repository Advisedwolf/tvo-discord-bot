// src/handlers/selectMenuHandler.js
import { replyError } from '../utils/replyHelpers.js';
import { t } from '../utils/translator.js';

export default {
  /** Handles string select menu interactions by customId lookup */
  async handle(interaction) {
    if (!interaction.isStringSelectMenu()) return;

    const { customId, client } = interaction;
    const command = client.commands.get(customId);

    if (!command) {
      // Localized "select menu command not found"
      return replyError(interaction, 'error.handler_not_found', {
        type: t('selectMenu.type', {}, interaction.user.locale),
      });
    }

    // Execute the select menu command; let errors bubble up
    await command.execute(interaction);
  },
};
