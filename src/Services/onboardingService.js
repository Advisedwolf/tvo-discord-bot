// src/services/onboardingService.js
// Centralized, multi-step onboarding flow with location & timezone

const logger = require('../utils/logger');
const translator = require('../utils/translator');
const UserProfile = require('../models/UserProfile');
const { askLocation } = require('./locationService');
const { presentVows } = require('./vowsService');
const { askAgeRange } = require('./ageService');
const { askBio }      = require('./bioService');
const { askGamingExperience } = require('./experienceService');
const { askFarms } = require('./farmsService');
const { presentAlertsForm } = require('./alertsOnboardingService');
const { askRuinsTime } = require('./ruinsTimeService');
const { askEventAttendance } = require('./eventAttendanceService');

module.exports = { onboardingButtonHandler };

/**
 * Handles the /onboarding button flow
 */
async function onboardingButtonHandler(interaction, client) {
  await interaction.deferUpdate({ ephemeral: true });
  const initialLocale = interaction.locale?.split('-')[0] || 'en';
  const userTag = interaction.user.tag;

  logger.info(
    translator.t('onboarding.logStart', initialLocale, { user: userTag }),
    'onboarding'
  );

  // Ensure profile exists or create
  let profile = await UserProfile.findOne({ userId: interaction.user.id });
  if (!profile) {
    profile = new UserProfile({ userId: interaction.user.id });
    await profile.save();
  }

  try {
    // STEP 1: Ask for location (country, subdivision, timezone, locale)
    const { country, subdivision, timezone, locale } = await askLocation(interaction.user);
    // locale, country, subdivision, timezone persisted inside askLocation

    logger.info(
      translator.t('onboarding.logLocation', locale, { country, subdivision, timezone }),
      'onboarding'
    );

    // STEP 2: Present Vow's and code of conduct for acceptance or rejection
    await presentVows(interaction.user);
    // 

    logger.info(
      translator.t('onboarding.logVows', locale, { user: userTag }),
      'onboarding'
    );


    // STEP 3: Present and ask for age range
    await askAgeRange(interaction.user, locale);
    // 

    logger.info(
      translator.t('onboarding.logAge', locale, { user: userTag }),
      'onboarding'
    );

    // STEP 4: Ask for Users Bio
    await askBio(    interaction.user, locale);
    // 

    logger.info(
      translator.t('onboarding.logBio', locale, { user: userTag }),
      'onboarding'
    );


    // STEP 5: Ask for users gaming experience
    await askGamingExperience(interaction.user, locale);

    //

    logger.info(
      translator.t('onboarding.logExperience', locale, { user: userTag }),
      'onboarding'
    );


    // STEP 6: How many farms does the player have.
    await askFarms(interaction.user, locale);

    //

    logger.info(
      translator.t('onboarding.logFarms', locale, { user: userTag }),
      'onboarding'
    );

    // STEP 7: Sign up for Scout, Attack or Event alerts.
      await presentAlertsForm(interaction);

    //

    logger.info(
      translator.t('onboarding.logAlerts', locale, { user: userTag }),
      'onboarding'
    );

    // STEP 8: Confirm ruins time choice.
      await askRuinsTime(interaction.user, locale);

    //

    logger.info(
      translator.t('onboarding.logRuins', locale, { user: userTag }),
      'onboarding'
    );


    // STEP 9: Confirm Event Attendance
      await askEventAttendance(interaction.user, locale);

    //

    logger.info(
      translator.t('onboarding.logEventAttendance', locale, { user: userTag }),
      'onboarding'
    );


    // STEP 3: Finalize onboarding
    await finalizeOnboarding(interaction, client, profile, locale);
    logger.info(
      translator.t('onboarding.logComplete', locale, { user: userTag }),
      'onboarding'
    );
  } catch (err) {
    logger.error(
      translator.t('onboarding.logError', initialLocale, { error: err.message }),
      'onboarding'
    );
    await interaction.followUp({
      content: translator.t('onboarding.errorGeneral', initialLocale),
      ephemeral: true
    });
  }
}




// Placeholder step functions (implementations omitted)

/**
 * Finalizes onboarding by assigning roles and announcing in guild
 */
async function finalizeOnboarding(interaction, client, profile, locale) {
  const guild = await client.guilds.fetch(process.env.GUILD_ID);
  const member = await guild.members.fetch(profile.userId);
  await member.roles.add(process.env.MEMBER_ROLE_ID);
  await member.roles.remove(process.env.VISITOR_ROLE_ID).catch(() => {});

  const channel = await guild.channels.fetch(process.env.ONBOARD_ANNOUNCE_CHANNEL_ID);
  const embed = new (require('discord.js').EmbedBuilder)()
    .setTitle(translator.t('onboarding.announceTitle', locale))
    .setDescription(translator.t('onboarding.announceDescription', locale, { user: member.user.username }))
    .setTimestamp();

  await channel.send({ embeds: [embed] });
}

