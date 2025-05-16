import { MessageFlags } from "discord.js";

export default {
  async handle(interaction) {
    console.log(
      "[TEST MODAL HANDLER] Modal submitted with customId:",
      interaction.customId,
    );
    await interaction.reply({
      content: `[TEST ENV] Modal submitted: ${interaction.customId}`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
