// src/services/ruinsTimeService.js
// Handles the Alliance Ruins time selection during onboarding

const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType
} = require('discord.js');
const logger = require('../utils/logger');
const translator = require('../utils/translator');
const UserProfile = require('../models/UserProfile');

/**
 * Prompts the user to select their preferred Alliance Ruins time.
 * @param {import('discord.js').User} user    - Discord User object
 * @param {string} locale                   - Locale code (e.g. 'en')
 */
async function askRuinsTime(user, locale) {
  const dm = await user.createDM();

  // Embed with title and description
  const embed = new EmbedBuilder()
    .setTitle(translator.t('onboarding.ruinsTitle', locale))
    .setDescription(translator.t('onboarding.ruinsDesc', locale))
    .setColor('Purple');

  // Options for ruins time
  const options = [
    { label: '00:00', value: '00:00' },
    { label: '18:00', value: '18:00' },
    { label: '20:00', value: '20:00' },
    { label: translator.t('onboarding.ruinsNone', locale), value: 'none' }
  ];

  const menu = new StringSelectMenuBuilder()
    .setCustomId('onboard_ruins_time')
    .setPlaceholder(translator.t('onboarding.selectRuinsTime', locale))
    .addOptions(options);

  const row = new ActionRowBuilder().addComponents(menu);

  // Send the embed and menu
  const message = await dm.send({ embeds: [embed], components: [row] });
  logger.debug(`Sent ruins time selector to ${user.tag}`, 'onboarding');

  // Await user selection
  const selection = await message.awaitMessageComponent({
    componentType: ComponentType.StringSelect,
    filter: i => i.user.id === user.id && i.customId === 'onboard_ruins_time',
    time: 120000
  });

  const chosen = selection.values[0];

  // Persist to profile
  const profile = await UserProfile.findOne({ userId: user.id });
  profile.ruinsTime = chosen;
  await profile.save();

  // Confirm selection
  await selection.update({
    content: translator.t('onboarding.ruinsConfirm', locale, { time: chosen }),
    embeds: [],
    components: []
  });
  logger.info(`Ruins time set to ${chosen} for ${user.tag}`, 'onboarding');
}

module.exports = { askRuinsTime };
