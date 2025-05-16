import { MessageFlags } from "discord.js";

export default {
  async handle(interaction) {
    console.log(
      "[TEST BUTTON HANDLER] Button clicked with customId:",
      interaction.customId,
    );
    await interaction.reply({
      content: `[TEST ENV] Button clicked: ${interaction.customId}`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
