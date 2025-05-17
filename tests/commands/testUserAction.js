// src/commands/testUserAction.js
import { ContextMenuCommandBuilder, ApplicationCommandType } from 'discord.js';

export const data = new ContextMenuCommandBuilder()
  .setName('Test User Action')
  .setType(ApplicationCommandType.User);

export async function execute(interaction) {
  console.log('[TEST USER] Context menu command executed:', interaction.targetUser.tag);
  await interaction.reply({
    content: `You clicked on user: ${interaction.targetUser.tag}`,
    ephemeral: true,
  });
}
