// src/commands/Interaction/testEmbed.js
import { SlashCommandBuilder } from 'discord.js';
import { getService } from '../../services/servicesRegistry.js';
import { createEmbed } from '../../services/functions/embedService.js';

export const data = new SlashCommandBuilder()
  .setName('testembed')
  .setDescription('Send a test embed by template type')
  .addStringOption((opt) =>
    opt
      .setName('type')
      .setDescription('Which embed template to test')
      .setRequired(true)
      .addChoices(
        { name: 'Info', value: 'info' },
        { name: 'Error', value: 'error' },
        { name: 'Minimal', value: 'minimal' },
        { name: 'Stats', value: 'stats' },
        { name: 'Profile', value: 'profile' },
        { name: 'Video', value: 'video' },
        { name: 'Announcement', value: 'announcement' },
        { name: 'Tips', value: 'tips' },
        { name: 'Question', value: 'question' },
        { name: 'FactFinding', value: 'factfinding' }
      )
  );

export async function execute(interaction) {
  // Always use the stub service named "testembed"
  const service = getService('testembed');
  const data = await service(interaction);
  const embed = createEmbed(data.template, data);
  await interaction.reply({ embeds: [embed], flags: 64 });
}
