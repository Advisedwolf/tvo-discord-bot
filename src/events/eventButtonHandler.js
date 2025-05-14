
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const { t } = require('../utils/translator');

const EVENTS_PATH = path.join(__dirname, '../../config/events.json');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isButton()) return;

    const [action, eventKey] = interaction.customId.split(':');
    if (action !== 'event_schedule') return;

    try {
      const events = JSON.parse(fs.readFileSync(EVENTS_PATH, 'utf8'));
      const event = events[eventKey];

      if (!event) {
        await interaction.reply({ content: t('event.unknownType', interaction.locale), flags: 64 });
        logger.warn(`Unknown eventKey triggered: ${eventKey}`, 'events');
        return;
      }

      await interaction.reply({
       content: t('event.creationComingSoon', interaction.locale, { label: event.label, type: event.type }),
        flags: 64
      });

      logger.debug(`Triggered event scheduling for: ${event.label}`, 'events');
      // In future: Launch modal or follow-up flow based on event.type
    } catch (err) {
      logger.error(`Button handler error: ${err.message}`, 'events');
      if (!interaction.replied) {
        await interaction.reply({ content: '❌ Error handling button click.', flags: 64 });
      }
    }
  }
};
