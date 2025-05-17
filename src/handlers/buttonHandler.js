// src/handlers/buttonHandler.js
import { replyError } from '../utils/replyHelpers.js';
import { t } from '../utils/translator.js';

export default {
  /** Handles button interactions by customId lookup */
  async handle(interaction) {
    if (!interaction.isButton()) return;

    const { customId, client } = interaction;
    const command = client.commands.get(customId);

    if (!command) {
      // Localized "button command not found"
      return replyError(interaction, 'error.handler_not_found', {
        type: t('button.type', {}, interaction.user.locale),
      });
    }

    // Execute the button command; let errors bubble up to central handler
    await command.execute(interaction);
  },
};
