// src/commands/Interaction/modal.js
import {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from "discord.js";
import { getService } from "../../services/servicesRegistry.js";
import { createEmbed } from "../../services/functions/embedService.js";

export const data = new SlashCommandBuilder()
  .setName("modal")
  .setDescription("Opens a modal dialog");

export async function execute(interaction) {
  // Determine the service key: slash uses commandName, modal-submit uses customId
  const key = interaction.isChatInputCommand()
    ? interaction.commandName
    : interaction.customId;

  // If it's the slash invocation, show the modal
  if (interaction.isChatInputCommand()) {
    const modal = new ModalBuilder()
      .setCustomId(key) // e.g. 'modal'
      .setTitle("Tell me something");

    const input = new TextInputBuilder()
      .setCustomId("feedback") // your form field ID
      .setLabel("What do you think of TVO?")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(input));
    return interaction.showModal(modal);
  }

  // Otherwise it must be a modal-submit
  if (interaction.isModalSubmit()) {
    // 1) Lookup your modal service
    const service = getService(key);

    // 2) Let the service process the submission & return embed data
    const result = await service(interaction);
    // e.g. { template: 'info', title: ..., description: ... }

    // 3) Build the embed
    const embed = createEmbed(result.template, result);

    // 4) Reply ephemerally with that embed
    return interaction.reply({ embeds: [embed], flags: 64 });
  }
}
