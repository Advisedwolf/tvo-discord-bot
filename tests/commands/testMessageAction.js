// src/commands/testMessageAction.js
import { ContextMenuCommandBuilder, ApplicationCommandType } from "discord.js";

export const data = new ContextMenuCommandBuilder()
  .setName("Test Message Action")
  .setType(ApplicationCommandType.Message);

export async function execute(interaction) {
  console.log("[TEST MESSAGE] Context menu command executed");
  await interaction.reply({
    content: `You clicked on message: ${interaction.targetId}`,
    ephemeral: true,
  });
}
