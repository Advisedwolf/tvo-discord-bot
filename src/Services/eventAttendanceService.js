// src/services/eventAttendanceService.js
// Handles user availability for Alliance events during onboarding

const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType
} = require('discord.js');
const logger = require('../utils/logger');
const translator = require('../utils/translator');
const UserProfile = require('../models/UserProfile');

const EVENTS = [
  {
    key: 'elite',
    labelKey: 'onboarding.eventAttendance.elite.title',
    descKey: 'onboarding.eventAttendance.elite.desc',
    profileField: 'eliteAttendance'
  },
  {
    key: 'defence',
    labelKey: 'onboarding.eventAttendance.defence.title',
    descKey: 'onboarding.eventAttendance.defence.desc',
    profileField: 'defenceAttendance'
  }
];

/**
 * Prompts the user for availability for each event.
 * @param {import('discord.js').User} user - The user to DM
 * @param {string} locale - Locale code (e.g., 'en')
 */
async function askEventAttendance(user, locale) {
  const dm = await user.createDM();

  // Attendance options
  const options = [
    { label: translator.t('onboarding.attendance.often', locale), value: 'often' },
    { label: translator.t('onboarding.attendance.sometimes', locale), value: 'sometimes' },
    { label: translator.t('onboarding.attendance.rarely', locale), value: 'rarely' }
  ];

  for (const event of EVENTS) {
    // Build embed for event
    const embed = new EmbedBuilder()
      .setTitle(translator.t(event.labelKey, locale))
      .setDescription(translator.t(event.descKey, locale))
      .setColor('Blue');

    // Build select menu
    const menu = new StringSelectMenuBuilder()
      .setCustomId(`onboard_event_${event.key}`)
      .setPlaceholder(translator.t('onboarding.selectAttendance', locale, { event: translator.t(event.labelKey, locale) }))
      .addOptions(options);
    const row = new ActionRowBuilder().addComponents(menu);

    // Send prompt
    const message = await dm.send({ embeds: [embed], components: [row] });
    logger.debug(`Sent attendance selector for ${event.key} to ${user.tag}`, 'onboarding');

    // Await response
    const selection = await message.awaitMessageComponent({
      componentType: ComponentType.StringSelect,
      filter: i => i.user.id === user.id && i.customId === `onboard_event_${event.key}`,
      time: 120000
    });

    const availability = selection.values[0];

    // Persist to profile
    const profile = await UserProfile.findOne({ userId: user.id });
    profile[event.profileField] = availability;
    await profile.save();

    // Confirm
    await selection.update({
      content: translator.t('onboarding.attendanceConfirm', locale, {
        event: translator.t(event.labelKey, locale),
        availability
      }),
      embeds: [],
      components: []
    });
    logger.info(`Event attendance for ${event.key} set to ${availability} for ${user.tag}`, 'onboarding');
  }
}

module.exports = { askEventAttendance };
