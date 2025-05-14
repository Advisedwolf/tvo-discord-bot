
const EventModel = require('../models/Event');
const logger = require('../utils/logger');
const { updateDiscordEvent } = require('../services/discordEventSync');
const { updateEventEmbedPost } = require('../services/eventEmbedSync');
const { t } = require('../utils/translator');
module.exports = {
  handleEditEventModal: async function(interaction, client) {
    if (!interaction.customId.startsWith('event_edit:')) return;

    const eventId = interaction.customId.split(':')[1];
    try {
      const event = await EventModel.findById(eventId);
      if (!event) {
        await interaction.reply({ content: t('events.notFound'), ephemeral: true });
        return;
      }

      const updates = {
        title: interaction.fields.getTextInputValue('title'),
        description: interaction.fields.getTextInputValue('description'),
        start: new Date(interaction.fields.getTextInputValue('start')).toISOString(),
        end: new Date(interaction.fields.getTextInputValue('end')).toISOString()
      };

      Object.assign(event, updates);
      await event.save();

      await updateDiscordEvent(event);
      await updateEventEmbedPost(event, client);

      await interaction.reply({ content: t('events.updateSuccess'), ephemeral: true });
      logger.info(`Updated event: ${event.title}`, 'events');

    } catch (err) {
      logger.error(`Failed to update event: ${err.message}`, 'events');
      await interaction.reply({ content: t('events.updateFail'), ephemeral: true });
    }
  }
};
