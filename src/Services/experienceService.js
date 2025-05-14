// src/services/experienceService.js
// Handles the gaming experience step in onboarding

const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType
} = require('discord.js');
const logger = require('../utils/logger');
const translator = require('../utils/translator');
const UserProfile = require('../models/UserProfile');

/**
 * Prompts the user to select their gaming experience (0-10 years)
 * @param {User} user - Discord User object
 * @param {string} locale - locale code (e.g. 'en')
 */
async function askGamingExperience(user, locale) {
  const dm = await user.createDM();

  // Build options for 0-10 years
  const options = Array.from({ length: 11 }, (_, i) => ({
    label: `${i}`,
    value: `${i}`
  }));

  const menu = new StringSelectMenuBuilder()
    .setCustomId('onboard_experience')
    .setPlaceholder(translator.t('onboarding.selectExperience', locale))
    .addOptions(options);

  // Send prompt
  await dm.send({
    content: translator.t('onboarding.selectExperience', locale),
    components: [new ActionRowBuilder().addComponents(menu)]
  });
  logger.debug(`Sent gaming experience selector to ${user.tag}`, 'onboarding');

  // Await selection
  const sel = await dm.awaitMessageComponent({
    filter: i => i.user.id === user.id && i.customId === 'onboard_experience',
    componentType: ComponentType.StringSelect,
    time: 120000
  });

  const years = parseInt(sel.values[0], 10);

  // Persist to profile
  const profile = await UserProfile.findOne({ userId: user.id });
  profile.gamingExperience = years;
  await profile.save();

  // Confirm selection
  await sel.update({
    content: translator.t('onboarding.experienceConfirm', locale, { years }),
    components: []
  });
  logger.info(`Gaming experience set to ${years} years for ${user.tag}`, 'onboarding');
}

module.exports = { askGamingExperience };
