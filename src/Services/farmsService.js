// src/services/farmsService.js
// Handles the farms count step in onboarding

const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType
} = require('discord.js');
const logger = require('../utils/logger');
const translator = require('../utils/translator');
const UserProfile = require('../models/UserProfile');

/**
 * Prompts the user to select how many farms they run (0, 1, 2-4, 5-10, 11+)
 * @param {User} user - Discord User object
 * @param {string} locale - locale code (e.g. 'en')
 */
async function askFarms(user, locale) {
  const dm = await user.createDM();

  // Build options
  const options = [
    { label: '0', value: '0' },
    { label: '1', value: '1' },
    { label: '2-4', value: '2-4' },
    { label: '5-10', value: '5-10' },
    { label: '11+', value: '11+' }
  ];

  const menu = new StringSelectMenuBuilder()
    .setCustomId('onboard_farms')
    .setPlaceholder(translator.t('onboarding.selectFarms', locale))
    .addOptions(options);

  // Send prompt
  await dm.send({
    content: translator.t('onboarding.selectFarms', locale),
    components: [new ActionRowBuilder().addComponents(menu)]
  });
  logger.debug(`Sent farms selector to ${user.tag}`, 'onboarding');

  // Await selection
  const sel = await dm.awaitMessageComponent({
    filter: i => i.user.id === user.id && i.customId === 'onboard_farms',
    componentType: ComponentType.StringSelect,
    time: 120000
  });

  const farmsCount = sel.values[0];

  // Persist to profile
  const profile = await UserProfile.findOne({ userId: user.id });
  profile.farms = farmsCount;
  await profile.save();

  // Confirm selection
  await sel.update({
    content: translator.t('onboarding.farmsConfirm', locale, { farms: farmsCount }),
    components: []
  });
  logger.info(`Farms set to ${farmsCount} for ${user.tag}`, 'onboarding');
}

module.exports = { askFarms };