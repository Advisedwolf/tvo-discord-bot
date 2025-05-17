import { SlashCommandBuilder } from '@discordjs/builders';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('testbutton')
  .setDescription('Sends a test button for interaction testing');

export async function execute(interaction) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('test_button')
      .setLabel('Click Me!')
      .setStyle(ButtonStyle.Primary)
  );

  await interaction.reply({
    content: 'Here is your test button:',
    components: [row],
    ephemeral: true,
  });
}
