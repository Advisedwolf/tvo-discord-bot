const { Events } = require('discord.js');
const { createDiscordEvent } = require('../services/eventScheduler');
const logger = require('../utils/logger');
const { t } = require('../utils/translator');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isModalSubmit() || interaction.customId !== 'submit_event_modal') return;

    const locale = interaction.locale || 'en';
    const title = interaction.fields.getTextInputValue('event_title');
    const description = interaction.fields.getTextInputValue('event_description');
    const start = interaction.fields.getTextInputValue('event_start');
    const end = interaction.fields.getTextInputValue('event_end');
const isValidDate = (str) => !isNaN(Date.parse(str));

if (!isValidDate(start)) {
  return await interaction.reply({ content: t('event.error.invalidStart', locale), ephemeral: true });
}

if (end && !isValidDate(end)) {
  return await interaction.reply({ content: t('event.error.invalidEnd', locale), ephemeral: true });
}
    try {
      await createDiscordEvent({ title, description, start, end, createdBy: interaction.user });
      await interaction.reply({ content: t('event.success.create', locale), ephemeral: true });
    } catch (err) {
      logger.error(`Failed to create event: ${err.message}`, 'event');
      await interaction.reply({ content: t('event.error.create', locale), ephemeral: true });
    }
  }
};
