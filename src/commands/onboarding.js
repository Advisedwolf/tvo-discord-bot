// src/commands/onboarding.js
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const translator = require('../utils/translator');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('onboarding')
    .setDescription(translator.t('onboarding.commandDesc', 'en')),

  async execute(interaction) {
    // Normalize locale (e.g., 'en', 'fr')
    const locale = interaction.locale?.split('-')[0] || 'en';

    // Log command invocation
    logger.info(
      `/onboarding command invoked by ${interaction.user.tag}`,
      'commands'
    );

    // Build start button
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('start_onboarding')
        .setLabel(translator.t('onboarding.startButton', locale))
        .setStyle(ButtonStyle.Primary)
    );

    // Attempt to send onboarding DM
    try {
      await interaction.user.send({
        content: translator.t('onboarding.welcomeDm', locale),
        components: [row]
      });
      logger.debug(
        `Sent onboarding DM to ${interaction.user.tag}`,
        'commands'
      );
    } catch (error) {
      logger.warn(
        `Failed to send onboarding DM to ${interaction.user.tag}: ${error.message}`,
        'commands'
      );
    }

    // Acknowledge in guild channel
    await interaction.reply({
      content: translator.t('onboarding.ackGuild', locale),
      ephemeral: true
    });
    logger.debug(
      `Acknowledged /onboarding in guild channel for ${interaction.user.tag}`,
      'commands'
    );
  }
};


