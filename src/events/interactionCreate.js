// src/events/interactionCreate.js
// Routes slash commands and component interactions (buttons, select menus, modals) to their handlers

const { onboardingButtonHandler } = require('../services/onboardingService');
const { shieldButtonHandler } = require('../services/shieldService');
const logger = require('../utils/logger');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    // 1️⃣ Slash commands
    if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName);
      logger.info(`Slash command received: /${interaction.commandName} from ${interaction.user.tag}`, 'interaction');
      if (!command) return;
      try {
        await command.execute(interaction, client);
      } catch (err) {
        logger.error(`Error executing /${interaction.commandName}: ${err.message}`, 'interaction');
        if (!interaction.replied) {
          await interaction.reply({
            content: '❌ An error occurred while running that command.',
            ephemeral: true,
          });
        }
      }
      return;
    }

    // 2️⃣ Button interactions
    if (interaction.isButton()) {
      logger.debug(`Button clicked: ${interaction.customId} by ${interaction.user.tag}`, 'interaction');
      switch (interaction.customId) {
        case 'start_onboarding':
          return onboardingButtonHandler(interaction, client);
        case 'start_shield':
          return shieldButtonHandler(interaction, client);
        // Add future button handlers here
        default:
          return;
      }
    }

    // 3️⃣ Select menus
    if (interaction.isSelectMenu()) {
      logger.debug(`Select menu used: ${interaction.customId} by ${interaction.user.tag}`, 'interaction');
      return;
    }

    // 4️⃣ Modals
    if (interaction.isModalSubmit()) {
      logger.debug(`Modal submitted: ${interaction.customId} by ${interaction.user.tag}`, 'interaction');

      if (interaction.customId.startsWith('event_edit:')) {
        const { handleEditEventModal } = require('../services/eventEditModalHandler');
        return handleEditEventModal(interaction, client);
      }

      if (interaction.customId === 'agenda_create_modal') {
        const { handleAgendaCreateModal } = require('../services/agendaCreateModalHandler');
        return handleAgendaCreateModal(interaction, client);
      }

      if (interaction.customId === 'agenda_submit_modal') {
        const { handleAgendaSubmission } = require('../services/agendaSubmissionHandler');
        return handleAgendaSubmission(interaction, client);
      }
    }
  }
};
