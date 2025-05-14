// src/commands/scheduleEventBoard.js
const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const translator = require('../utils/translator');

const EVENTS_PATH = path.join(__dirname, '..', '..', 'config', 'events.json');
const CHANNEL_ID = process.env.EVENT_PLANS_CHANNEL_ID;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('scheduleeventboard')
    .setDescription(translator.t('event.scheduleBoardDesc', 'en'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const locale = interaction.locale?.split('-')[0] || 'en';
    logger.info(
      `Executing /scheduleeventboard by ${interaction.user.tag}`,
      'commands'
    );

    try {
      const raw = fs.readFileSync(EVENTS_PATH, 'utf8');
      const events = JSON.parse(raw);
      const grouped = {};

      for (const [key, event] of Object.entries(events)) {
        if (!grouped[event.category]) grouped[event.category] = [];
        grouped[event.category].push({ key, label: event.label });
      }

      const rows = [];
      for (const category of Object.keys(grouped)) {
        const buttons = grouped[category].map(evt =>
          new ButtonBuilder()
            .setCustomId(`event_schedule:${evt.key}`)
            .setLabel(evt.label)
            .setStyle(ButtonStyle.Primary)
        );

        for (let i = 0; i < buttons.length; i += 5) {
          rows.push(new ActionRowBuilder().addComponents(buttons.slice(i, i + 5)));
        }
      }

      const channel = await interaction.client.channels.fetch(CHANNEL_ID);
      await channel.send({
        content: translator.t('event.schedulePrompt', locale),
        components: rows
      });

      await interaction.reply({
        content: translator.t('event.schedulePosted', locale),
        ephemeral: true
      });

      logger.info(
        `Event board posted to channel ${CHANNEL_ID} by ${interaction.user.tag}`,
        'commands'
      );
    } catch (err) {
      logger.error(
        `Failed to post event board: ${err.message}`,
        'commands'
      );
      await interaction.reply({
        content: translator.t('event.scheduleError', locale),
        ephemeral: true
      });
    }
  }
};

