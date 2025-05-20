// src/handlers/userContextMenuHandler.js
import { replyError } from '../utils/replyHelpers.js';
import { t } from '../utils/translator.js';

export default {
  /** Handles User Context Menu interactions by commandName lookup */
  async handle(interaction) {
    if (!interaction.isUserContextMenuCommand()) return;

    const { commandName, client } = interaction;
    const command = client.commands.get(commandName);

    if (!command) {
      // Localized "handler not found" for user context menu
      return replyError(interaction, 'error.handler_not_found', {
        type: t('userContextMenu.type', {}, interaction.user.locale),
      });
    }

    // Execute the user context menu command; allow errors to bubble up
    await command.execute(interaction);
  },
};
