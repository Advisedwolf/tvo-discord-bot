// src/commands/profile.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const UserProfile = require('../models/UserProfile');
const logger = require('../utils/logger');
const translator = require('../utils/translator');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription(translator.t('profile.commandDesc', 'en'))
    .addSubcommand(sub =>
      sub
        .setName('view')
        .setDescription(translator.t('profile.viewDesc', 'en'))
    )
    .addSubcommandGroup(group =>
      group
        .setName('update')
        .setDescription(translator.t('profile.updateGroupDesc', 'en'))
        .addSubcommand(sub =>
          sub
            .setName('country')
            .setDescription(translator.t('profile.updateCountryDesc', 'en'))
            .addStringOption(opt =>
              opt
                .setName('value')
                .setDescription(translator.t('profile.updateCountryValueDesc', 'en'))
                .setRequired(true)
            )
        )
        .addSubcommand(sub =>
          sub
            .setName('timezone')
            .setDescription(translator.t('profile.updateTimezoneDesc', 'en'))
            .addStringOption(opt =>
              opt
                .setName('value')
                .setDescription(translator.t('profile.updateTimezoneValueDesc', 'en'))
                .setRequired(true)
            )
        )
        .addSubcommand(sub =>
          sub
            .setName('age_range')
            .setDescription(translator.t('profile.updateAgeDesc', 'en'))
            .addStringOption(opt =>
              opt
                .setName('value')
                .setDescription(translator.t('profile.updateAgeValueDesc', 'en'))
                .setRequired(true)
                .addChoices(
                  { name: translator.t('age.Under18', 'en'), value: 'Under 18' },
                  { name: translator.t('age.18to30', 'en'), value: '18-30' },
                  { name: translator.t('age.31to50', 'en'), value: '31-50' },
                  { name: translator.t('age.50plus', 'en'), value: '50+' }
                )
            )
        )
        .addSubcommand(sub =>
          sub
            .setName('experience')
            .setDescription(translator.t('profile.updateExperienceDesc', 'en'))
            .addIntegerOption(opt =>
              opt
                .setName('years')
                .setDescription(translator.t('profile.updateExperienceValueDesc', 'en'))
                .setRequired(true)
                .addChoices(...Array.from({ length: 10 }, (_, i) => ({ name: `${i+1}`, value: i+1 })))
            )
        )
        .addSubcommand(sub =>
          sub
            .setName('farms')
            .setDescription(translator.t('profile.updateFarmsDesc', 'en'))
            .addStringOption(opt =>
              opt
                .setName('value')
                .setDescription(translator.t('profile.updateFarmsValueDesc', 'en'))
                .setRequired(true)
                .addChoices(
                  { name: '0', value: '0' },
                  { name: '1', value: '1' },
                  { name: '2-4', value: '2-4' },
                  { name: '5-10', value: '5-10' },
                  { name: '10+', value: '10+' }
                )
            )
        )
        .addSubcommand(sub =>
          sub
            .setName('bio')
            .setDescription(translator.t('profile.updateBioDesc', 'en'))
            .addStringOption(opt =>
              opt
                .setName('value')
                .setDescription(translator.t('profile.updateBioValueDesc', 'en'))
                .setRequired(true)
            )
        )
    ),

  async execute(interaction) {
    const locale = interaction.locale?.split('-')[0] || 'en';
    const group = interaction.options.getSubcommandGroup(false);
    const sub = interaction.options.getSubcommand();
    const userId = interaction.user.id;

    logger.info(
      translator.t('profile.logInvoke', locale, { user: interaction.user.tag, sub }),
      'commands'
    );

    let profile = await UserProfile.findOne({ userId });
    if (!profile) {
      return interaction.reply({ content: translator.t('profile.noProfile', locale), ephemeral: true });
    }

    // View profile
    if (!group && sub === 'view') {
      const keys = ['country', 'timezone', 'ageRange', 'gamingExperience', 'farms'];
      const completed = keys.filter(k => profile[k]).length;
      const percent = Math.round((completed / keys.length) * 100);

      const embed = new EmbedBuilder()
        .setTitle(translator.t('profile.viewTitle', locale, { username: interaction.user.username }))
        .addFields(
          { name: translator.t('profile.fieldCountry', locale), value: profile.country || '—', inline: true },
          { name: translator.t('profile.fieldTimezone', locale), value: profile.timezone || '—', inline: true },
          { name: translator.t('profile.fieldAgeRange', locale), value: profile.ageRange || '—', inline: true },
          { name: translator.t('profile.fieldGamingExp', locale), value: profile.gamingExperience ? `${profile.gamingExperience} yrs` : '—', inline: true },
          { name: translator.t('profile.fieldFarms', locale), value: profile.farms || '—', inline: true },
          { name: translator.t('profile.fieldCompletion', locale), value: `${percent}%`, inline: true }
        )
        .addFields({ name: translator.t('profile.fieldBio', locale), value: profile.bio || '—' })
        .setTimestamp();

      logger.debug(
        translator.t('profile.logView', locale, { user: interaction.user.tag }),
        'commands'
      );

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Update profile field
    if (group === 'update') {
      let updatedFieldKey;
      let updatedValue;

      switch (sub) {
        case 'country':
          updatedValue = interaction.options.getString('value');
          profile.country = updatedValue;
          updatedFieldKey = 'profile.fieldCountry';
          break;
        case 'timezone':
          updatedValue = interaction.options.getString('value').toUpperCase();
          profile.timezone = updatedValue;
          updatedFieldKey = 'profile.fieldTimezone';
          break;
        case 'age_range':
          updatedValue = interaction.options.getString('value');
          profile.ageRange = updatedValue;
          updatedFieldKey = 'profile.fieldAgeRange';
          break;
        case 'experience':
          updatedValue = interaction.options.getInteger('years');
          profile.gamingExperience = updatedValue;
          updatedFieldKey = 'profile.fieldGamingExp';
          break;
        case 'farms':
          updatedValue = interaction.options.getString('value');
          profile.farms = updatedValue;
          updatedFieldKey = 'profile.fieldFarms';
          break;
        case 'bio':
          updatedValue = interaction.options.getString('value');
          profile.bio = updatedValue;
          updatedFieldKey = 'profile.fieldBio';
          break;
        default:
          logger.warn(
            translator.t('profile.logInvalid', locale, { user: interaction.user.tag }),
            'commands'
          );
          return interaction.reply({ content: translator.t('profile.invalidUpdate', locale), ephemeral: true });
      }

      await profile.save();

      logger.info(
        translator.t('profile.logUpdate', locale, { user: interaction.user.tag, field: sub, value: updatedValue }),
        'commands'
      );

      return interaction.reply({
        content: translator.t('profile.updateConfirm', locale, {
          field: translator.t(updatedFieldKey, locale),
          value: updatedValue
        }),
        ephemeral: true
      });
    }

    // Fallback
    logger.warn(
      translator.t('profile.logInvalid', locale, { user: interaction.user.tag }),
      'commands'
    );
    return interaction.reply({ content: translator.t('profile.invalidCommand', locale), ephemeral: true });
  }
};
