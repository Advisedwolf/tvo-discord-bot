// src/handlers/selectMenuHandler.js

export default {
  async handle(interaction) {
    console.log(
      "[TEST SELECT MENU] Select menu chosen:",
      interaction.customId,
      interaction.values,
    );
    await interaction.reply({
      content: `[TEST SELECT MENU] You selected: ${interaction.values.join(", ")}`,
      ephemeral: true,
    });
  },
};
