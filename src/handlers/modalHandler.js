// src/handlers/modalHandler.js
import { replyError } from '../utils/replyHelpers.js';
import { t } from '../utils/translator.js';

export default {
  /** Handles modal submit interactions by customId lookup */
  async handle(interaction) {
    if (!interaction.isModalSubmit()) return;

    const { customId, client } = interaction;
    const command = client.commands.get(customId);

    if (!command) {
      // Localized "modal command not found"
      return replyError(interaction, 'error.handler_not_found', {
        type: t('modal.type', {}, interaction.user.locale),
      });
    }

    // Execute the modal command; let errors bubble up to central handler
    await command.execute(interaction);
  },
};
