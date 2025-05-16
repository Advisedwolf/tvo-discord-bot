import { MessageFlags } from "discord.js";

export default {
  async handle(interaction) {
    console.log(
      "[TEST USER CONTEXT MENU HANDLER] Command:",
      interaction.commandName,
      "Target user:",
      interaction.targetUser?.tag,
    );
    await interaction.reply({
      content: `[TEST ENV] User context menu command received: ${interaction.commandName} on user ${interaction.targetUser?.tag}`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
