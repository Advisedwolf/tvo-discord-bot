const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { t } = require('../utils/translator');

module.exports = {
  data: {
    name: 'event_add_modal'
  },
  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('submit_event_modal')
      .setTitle(t('event.createTitle', interaction.locale));

    const titleInput = new TextInputBuilder()
      .setCustomId('event_title')
      .setLabel(t('event.fields.title', interaction.locale))
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const descriptionInput = new TextInputBuilder()
      .setCustomId('event_description')
      .setLabel(t('event.fields.description', interaction.locale))
      .setStyle(TextInputStyle.Paragraph);

    const startInput = new TextInputBuilder()
      .setCustomId('event_start')
      .setLabel(t('event.fields.start', interaction.locale))
      .setPlaceholder('e.g., 2025-06-01T18:00')
      .setRequired(true)      
      .setStyle(TextInputStyle.Short);
      

    const endInput = new TextInputBuilder()
      .setCustomId('event_end')
      .setLabel(t('event.fields.end', interaction.locale))
      .setPlaceholder('e.g., 2025-06-01T20:00')
      .setRequired(false)
      .setStyle(TextInputStyle.Short);

    const row1 = new ActionRowBuilder().addComponents(titleInput);
    const row2 = new ActionRowBuilder().addComponents(descriptionInput);
    const row3 = new ActionRowBuilder().addComponents(startInput);
    const row4 = new ActionRowBuilder().addComponents(endInput);

    modal.addComponents(row1, row2, row3, row4);
    await interaction.showModal(modal);
  }
};
