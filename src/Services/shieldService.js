// src/services/shieldService.js
require('dotenv').config();
const moment = require('moment');
const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType,
  EmbedBuilder
} = require('discord.js');
const Shield = require('../models/Shield');
const UserProfile = require('../models/UserProfile');
const { t } = require('../utils/translator');
const logger = require('../utils/logger');

/**
 * Handles shield setup via slash command or button interaction
 * @param {import('discord.js').Interaction} interaction
 * @param {import('discord.js').Client} client
 */
async function shieldButtonHandler(interaction, client) {
  logger.info(`Shield interaction started by ${interaction.user.tag}`, 'shield');
  try {
    if (interaction.isChatInputCommand() && !interaction.deferred && !interaction.replied) {
      await interaction.deferReply({ flags: 1 << 6 });
    } else if (interaction.isButton() && !interaction.deferred && !interaction.replied) {
      await interaction.deferUpdate();
    }

    const profile = await UserProfile.findOne({ userId: interaction.user.id });
    const locale = profile?.locale || 'en';
    const dm = await interaction.user.createDM();

    // Prompt for coordinates
    logger.debug('Prompted for coordinates', 'shield');
    await dm.send(t('shield.flow.promptCoordinates', locale));
    const coordMsg = (await dm.awaitMessages({
      filter: m => m.author.id === interaction.user.id,
      max: 1,
      time: 120000
    })).first();
    if (!coordMsg) {
      await dm.send(t('shield.flow.errorTimeout', locale));
      return;
    }
    logger.debug(`Coordinates received: ${location}`, 'shield');
    const location = coordMsg.content.trim();

    // Prompt for duration
    const durationRow = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('select_shield_duration')
        .setPlaceholder(t('shield.flow.promptDuration', locale))
        .addOptions([
          { label: '2 hours', value: '2' },
          { label: '8 hours', value: '8' },
          { label: '1 day', value: '24' },
          { label: '3 days', value: '72' }
        ])
    );
    const durMsg = logger.debug('Prompted for duration selection', 'shield');
    await dm.send({ components: [durationRow] });
    const durInter = await durMsg.awaitMessageComponent({
      componentType: ComponentType.StringSelect,
      filter: i => i.user.id === interaction.user.id,
      time: 120000
    }).catch(() => null);
    if (!durInter) {
      await dm.send(t('shield.flow.errorTimeout', locale));
      return;
    }
    await durInter.deferUpdate();
    logger.debug(`Duration selected: ${hours} hours`, 'shield');
    const hours = Number(durInter.values[0]);

    // Prompt for start time
logger.debug('Prompted for start time', 'shield');
    await dm.send(t('shield.flow.promptStartTime', locale));
    const startMsg = (await dm.awaitMessages({
      filter: m => m.author.id === interaction.user.id,
      max: 1,
      time: 120000
    })).first();

    let startTime = moment.utc();
    logger.debug(`Start time input: ${input}`, 'shield');
    const input = startMsg?.content.trim().toLowerCase();

    if (!input || input === 'now') {
      startTime = moment.utc();
    } else {
      const parsed = moment.utc(input, ['HH:mm', 'YYYY-MM-DDTHH:mm', moment.ISO_8601], true);
      if (parsed.isValid()) {
        startTime = parsed;
      } else {
        await dm.send("⚠️ I couldn't parse that time. Using the current time instead.");
      }
    }

    logger.debug(`End time calculated: ${endTime.format('YYYY-MM-DD HH:mm')} UTC`, 'shield');
    const endTime = startTime.clone().add(hours, 'hours');

    const shield = await Shield.create({
      playerId: interaction.user.id,
      playerLocale: locale,
      location,
      startTime: startTime.toDate(),
      endTime: endTime.toDate(),
      messageId: '',
      reactedUserIds: [],
      lastStatus: 'active',
      warned15min: false
    });

    const embed = new EmbedBuilder()
      .setColor('#4DB6E2')
      .setTitle(t('shield.embed.titleActive', locale))
      .addFields(
        { name: t('shield.embed.fieldPlayer', locale), value: '<@' + shield.playerId + '>', inline: true },
        { name: t('shield.embed.fieldLocation', locale), value: shield.location, inline: true },
        { name: t('shield.embed.fieldStartDate', locale), value: startTime.format('YYYY-MM-DD'), inline: true },
        { name: t('shield.embed.fieldStart', locale), value: startTime.format('HH:mm') + ' UTC', inline: true },
        { name: t('shield.embed.fieldDuration', locale), value: hours + ' ' + t('shield.embed.hours', locale), inline: true },
        { name: t('shield.embed.fieldEndDate', locale), value: endTime.format('YYYY-MM-DD'), inline: true },
        { name: t('shield.embed.fieldEnds', locale), value: endTime.format('HH:mm') + ' UTC', inline: true }
      )
      .setFooter({ text: t('shield.embed.footer', locale) });

    const channel = await client.channels.fetch(process.env.SHIELD_CHANNEL_ID);
    logger.info(`Shield message posted with ID: ${posted.id}`, 'shield');
    const posted = await channel.send({ embeds: [embed] });

    shield.messageId = posted.id;
    await shield.save();

    await dm.send(t('shield.flow.confirmShared', locale));
    if (interaction.isChatInputCommand() && !interaction.replied) {
      await interaction.editReply({
        content: t('shield.flow.cmdAck', locale),
        flags: 1 << 6
      });
    }
  } catch (err) {
    logger.error(`Shield handler error: ${err.message}`, 'shield');
    if (interaction.isChatInputCommand() && !interaction.replied) {
      await interaction.followUp({
        content: t('shield.flow.errorStart', 'en'),
        flags: 1 << 6
      });
    }
  }
}

module.exports = { shieldButtonHandler };
