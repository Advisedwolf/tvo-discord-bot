// src/modals/agendaSubmissionHandler.js
const { ModalSubmitInteraction } = require('discord.js');
const AgendaItem = require('../models/AgendaItem');
const logger = require('../utils/logger');
const translator = require('../utils/translator');
const { scheduleMessageCleanup } = require('../utils/cleanupScheduler');

module.exports = {
  /**
   * Handles submission of leadership agenda items from modals.
   * @param {ModalSubmitInteraction} interaction
   */
  async handleAgendaSubmission(interaction) {
    if (!interaction.isModalSubmit()) return;
    if (interaction.customId !== 'agenda_add_modal') return;

    const locale = interaction.locale?.split('-')[0] || 'en';
    const title = interaction.fields.getTextInputValue('agenda_topic');
    const description = interaction.fields.getTextInputValue('agenda_description');
    const assignee = interaction.fields.getTextInputValue('agenda_assignee');
    const dueDateInput = interaction.fields.getTextInputValue('agenda_due');
    const priority = interaction.fields.getTextInputValue('agenda_priority');
    const category = interaction.fields.getTextInputValue('agenda_category');

    try {
      const agendaItem = new AgendaItem({
        title,
        description,
        assignedTo: assignee,
        createdBy: interaction.user.id,
        dueDate: dueDateInput ? new Date(dueDateInput) : null,
        priority,
        category,
        status: 'Open',
        lastUpdated: new Date(),
        history: [
          { action: 'create', by: interaction.user.id, time: new Date() }
        ]
      });

      await agendaItem.save();

      await interaction.reply({
        content: translator.t('agenda.createdSuccess', locale, { title }),
        ephemeral: true
      });

      logger.info(
        translator.t('agenda.logCreated', locale, { title, user: interaction.user.tag }),
        'agenda'
      );

      // Schedule cleanup of the confirmation message
      scheduleMessageCleanup(interaction.channelId, interaction.id, 3600);

    } catch (err) {
      logger.error(
        translator.t('agenda.logError', locale, { error: err.message }),
        'agenda'
      );
      await interaction.reply({
        content: translator.t('agenda.errorCreate', locale),
        ephemeral: true
      });
    }
  }
};

