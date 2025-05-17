// src/commands/Interaction/selectMenu.js
import { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { getService } from '../../services/servicesRegistry.js';
import { createEmbed } from '../../services/functions/embedService.js';

export const data = new SlashCommandBuilder()
  .setName('selectmenu')
  .setDescription('Shows a select menu');

export async function execute(interaction) {
  // 1) Determine service key (slash vs component)
  const key = interaction.isChatInputCommand() ? interaction.commandName : interaction.customId;

  // 2) Lookup the service
  const service = getService(key);

  // 3) Run the service for both phases
  const result = await service(interaction);

  // 4a) Initial slash → send dropdown
  if (interaction.isChatInputCommand()) {
    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(key)
        .setPlaceholder(result.placeholder || 'Choose an option…')
        .addOptions(result.options)
    );
    return interaction.reply({
      content: result.prompt,
      components: [row],
      flags: 64,
    });
  }

  // 4b) Menu selection → send embed
  if (interaction.isStringSelectMenu()) {
    const embed = createEmbed(result.template, result);
    return interaction.reply({ embeds: [embed], flags: 64 });
  }
}
