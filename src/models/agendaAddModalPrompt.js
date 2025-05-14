// src/modals/agendaAddModalPrompt.js
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { t } = require('../utils/translator');
const logger = require('../utils/logger');

module.exports = {
  data: {
    name: 'agenda_add_modal',
  },

  async execute(interaction) {
    const locale = interaction.locale?.split('-')[0] || 'en';
    logger.debug(`Opening leadership agenda modal for ${interaction.user.tag}`, 'agenda');

    const modal = new ModalBuilder()
      .setCustomId('agenda_add_modal')
      .setTitle(t('agenda.modal.title', locale));

    const topicInput = new TextInputBuilder()
      .setCustomId('agenda_topic')
      .setLabel(t('agenda.modal.topic', locale))
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const descriptionInput = new TextInputBuilder()
      .setCustomId('agenda_description')
      .setLabel(t('agenda.modal.description', locale))
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const assigneeInput = new TextInputBuilder()
      .setCustomId('agenda_assignee')
      .setLabel(t('agenda.modal.assignee', locale))
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const dueDateInput = new TextInputBuilder()
      .setCustomId('agenda_due')
      .setLabel(t('agenda.modal.due', locale))
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const priorityInput = new TextInputBuilder()
      .setCustomId('agenda_priority')
      .setLabel(t('agenda.modal.priority', locale))
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(topicInput),
      new ActionRowBuilder().addComponents(descriptionInput),
      new ActionRowBuilder().addComponents(assigneeInput),
      new ActionRowBuilder().addComponents(dueDateInput),
      new ActionRowBuilder().addComponents(priorityInput)
    );

    await interaction.showModal(modal);
  }
};

