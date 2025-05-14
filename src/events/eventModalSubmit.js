// src/events/eventModalSubmit.js
const { Events } = require('discord.js');
const { createDiscordEventAndPost } = require('../services/eventCreateHandler');
const Event = require('../models/Event');
const logger = require('../utils/logger');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    if (!interaction.isModalSubmit()) return;
    if (!interaction.customId.startsWith('event_create_')) return;

    try {
      const title = interaction.fields.getTextInputValue('event_title');
      const description = interaction.fields.getTextInputValue('event_desc');
      const startTime = interaction.fields.getTextInputValue('event_start');
      const endTime = interaction.fields.getTextInputValue('event_end');

      // Validate required fields
      if (!title || !description || !startTime) {
        await interaction.reply({ content: '❌ All fields except end time are required.', flags: 64 });
        return;
      }

      // Validate start time format
      if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(startTime)) {
        await interaction.reply({ content: '❌ Invalid start time format. Use YYYY-MM-DDTHH:MM', flags: 64 });
        return;
      }

      // Validate end time format (if provided)
      if (endTime && !/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(endTime)) {
        await interaction.reply({ content: '❌ Invalid end time format. Use YYYY-MM-DDTHH:MM', flags: 64 });
        return;
      }

      // Create Discord scheduled event and post
      const result = await createDiscordEventAndPost({
        title,
        description,
        startTime,
        endTime,
        createdBy: interaction.user.id
      }, client);

      logger.info(`Scheduled and posted event: ${title}`, 'events');
      await interaction.reply({ content: '✅ Event created and posted successfully.', flags: 64 });
    } catch (err) {
      logger.error(`Event modal submission failed: ${err.message}`, 'events');
      await interaction.reply({ content: '❌ Failed to create event. Please try again later.', flags: 64 });
    }
  }
};
