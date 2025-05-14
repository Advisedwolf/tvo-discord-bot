// src/commands/shield.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { shieldButtonHandler } = require('../services/shieldService');
const logger = require('../utils/logger');
const translator = require('../utils/translator');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shield')
    .setDescription(translator.t('shield.commandDesc', 'en'))
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

  async execute(interaction) {
    const locale = interaction.locale?.split('-')[0] || 'en';

    try {
      logger.info(
        translator.t('shield.logTriggered', locale, { user: interaction.user.tag }),
        'shield'
      );

      if (!interaction.deferred && !interaction.replied) {
        logger.debug(
          translator.t('shield.logDeferred', locale),
          'shield'
        );
        await interaction.deferReply({ ephemeral: true });
      }

      // Delegate to the shared shield service
      await shieldButtonHandler(interaction, interaction.client);

      logger.debug(
        translator.t('shield.logHandlerSuccess', locale),
        'shield'
      );
    } catch (err) {
      logger.error(
        translator.t('shield.logErrorExecute', locale, { error: err.message }),
        'shield'
      );

      if (!interaction.replied) {
        logger.warn(
          translator.t('shield.logFollowUp', locale),
          'shield'
        );
        await interaction.followUp({
          content: translator.t('shield.errorExecute', locale),
          ephemeral: true
        });
      }
    }
  }
};

