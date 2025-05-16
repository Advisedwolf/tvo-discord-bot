import { MessageFlags } from "discord.js";

export default {
  async handle(interaction) {
    console.log(
      "[TEST MESSAGE CONTEXT MENU HANDLER] Command:",
      interaction.commandName,
    );
    await interaction.reply({
      content: `[TEST ENV] Message context menu command received: ${interaction.commandName}`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
