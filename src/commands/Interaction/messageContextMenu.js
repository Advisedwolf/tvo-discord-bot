// src/commands/Interaction/messageContextMenu.js
import { ContextMenuCommandBuilder, ApplicationCommandType } from 'discord.js';
import { getService } from '../../services/servicesRegistry.js';
import { createEmbed } from '../../services/functions/embedService.js';

export const data = new ContextMenuCommandBuilder()
  .setName('messageAction') // must exactly match your service key
  .setType(ApplicationCommandType.Message);

export async function execute(interaction) {
  // For context menus, the key is always the commandName
  const key = interaction.commandName;

  // Lookup and run the business-logic service
  const service = getService(key);
  const result = await service(interaction);
  // Expected result: { template, title, description, fields? }

  // Build the embed via your centralized embedService
  const embed = createEmbed(result.template, result);

  // Reply ephemerally with the embed
  return interaction.reply({ embeds: [embed], flags: 64 });
}
