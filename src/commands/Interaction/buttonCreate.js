// src/commands/Interaction/buttonCreate.js
import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { getService } from "../../services/servicesRegistry.js";
import { createEmbed } from "../../services/functions/embedService.js";

export const data = new SlashCommandBuilder()
  .setName("button")
  .setDescription("Creates a dynamic button");

export async function execute(interaction) {
  // Decide if this is the initial slash or a button click:
  const isSlash = interaction.isChatInputCommand();
  const key = isSlash ? interaction.commandName : interaction.customId;

  // Lookup the service:
  const service = getService(key);
  const result = await service(interaction);
  // result: { template, title, description, buttonLabel? }

  // Build embed:
  const embed = createEmbed(result.template, result);

  if (isSlash) {
    // On slash: send embed + button
    const button = new ButtonBuilder()
      .setCustomId(key)
      .setLabel(result.buttonLabel ?? "Click Me!")
      .setStyle(ButtonStyle.Primary);

    const actionRow = new ActionRowBuilder().addComponents(button);

    return interaction.reply({
      embeds: [embed],
      components: [actionRow],
      flags: 64,
    });
  } else {
    // On button click: just send confirmation embed
    return interaction.reply({ embeds: [embed], flags: 64 });
  }
}
