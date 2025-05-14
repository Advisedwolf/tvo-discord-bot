// src/commands/eventEditCommand.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { buildEventEditModal } = require('../components/eventModalPrompt');
const logger = require('../utils/logger');
const translator = require('../utils/translator');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('event-edit')
    .setDescription(translator.t('event.commands.eventEdit.description', 'en'))
    .addStringOption(option =>
      option
        .setName('id')
        .setDescription(translator.t('event.commands.eventEdit.idDescription', 'en'))
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents),

  async execute(interaction) {
    const locale = interaction.locale?.split('-')[0] || 'en';
    try {
      const eventId = interaction.options.getString('id');
      await interaction.showModal(buildEventEditModal(eventId));

      logger.debug(
        translator.t('event.commands.eventEdit.logLaunched', locale, { id: eventId, user: interaction.user.tag }),
        'commands'
      );
    } catch (err) {
      logger.error(
        translator.t('event.commands.eventEdit.logError', locale, { error: err.message }),
        'commands'
      );

      return interaction.reply({
        content: translator.t('errors.generic', locale),
        ephemeral: true
      });
    }
  }
};
