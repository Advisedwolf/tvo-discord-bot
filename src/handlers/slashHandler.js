// src/handlers/slashHandler.js
import { replyError } from "../utils/replyHelpers.js";
import { t } from "../utils/translator.js";

export default {
  /** Handles a Chat Input (slash) command interaction */
  async handle(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, client } = interaction;
    const command = client.commands.get(commandName);

    if (!command) {
      // Localized "command not found" error
      return replyError(interaction, "error.command_not_found");
    }

    // Execute the command; let any errors bubble up to the central handler
    await command.execute(interaction);
  },
};
