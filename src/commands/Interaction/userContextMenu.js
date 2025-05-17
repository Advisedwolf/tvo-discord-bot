// src/commands/Interaction/userContextMenu.js
import { ContextMenuCommandBuilder, ApplicationCommandType } from 'discord.js';
import { getService } from '../../services/servicesRegistry.js';
import { createEmbed } from '../../services/functions/embedService.js';

export const data = new ContextMenuCommandBuilder()
  .setName('userAction') // matches your service key
  .setType(ApplicationCommandType.User);

export async function execute(interaction) {
  // Context menus always use commandName as their key
  const key = interaction.commandName; // 'userAction'

  // 1) Lookup the matching service
  const service = getService(key);

  // 2) Run business logic
  const result = await service(interaction);
  // Expected result: { template, title, description, fields? }

  // 3) Build embed
  const embed = createEmbed(result.template, result);

  // 4) Reply ephemerally
  return interaction.reply({ embeds: [embed], flags: 64 });
}
