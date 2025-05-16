// src/handlers/messageContextMenuHandler.js
import { replyError } from "../utils/replyHelpers.js";
import { t } from "../utils/translator.js";

export default {
  /** Handles Message Context Menu interactions by commandName lookup */
  async handle(interaction) {
    if (!interaction.isMessageContextMenuCommand()) return;

    const { commandName, client } = interaction;
    const command = client.commands.get(commandName);

    if (!command) {
      // Localized "handler not found" for message context menu
      return replyError(interaction, "error.handler_not_found", {
        type: t("messageContextMenu.type", {}, interaction.user.locale),
      });
    }

    // Execute the message context menu command; let errors bubble up
    await command.execute(interaction);
  },
};
