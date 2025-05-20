// src/commands/settings/locale.js
import { SlashCommandBuilder } from 'discord.js';
import { t, getSupportedLocales } from '../../utils/translator.js';
import { replyError, replySuccess } from '../../utils/replyHelpers.js';
import logger from '../../utils/logger.js';
import UserProfile from '../../models/UserProfile.js'; // your Mongoose model for user settings

export default {
  data: new SlashCommandBuilder()
    .setName('settings')
    .setDescription('User-specific settings')
    .addSubcommand(sub =>
      sub
        .setName('locale')
        .setDescription('Set your preferred language')
        .addStringOption(opt => {
          const locales = getSupportedLocales();
          const option = opt
            .setName('language')
            .setDescription('Choose your locale')
            .setRequired(true);
          // add each supported locale as a choice
          locales.forEach(code => {
            option.addChoices({ name: code, value: code });
          });
          return option;
        })
    ),

  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;
    const sub = interaction.options.getSubcommand();
    if (sub !== 'locale') return;

    const chosen = interaction.options.getString('language', true);
    const userId = interaction.user.id;

    try {
      // upsert user profile with chosen locale
      await UserProfile.findOneAndUpdate(
        { userId },
        { locale: chosen },
        { upsert: true }
      );
      logger.info(`[settings] User ${userId} set locale to ${chosen}`);

      // Reply in the newly chosen language
      const confirm = t('SETTINGS.localeSuccess', { locale: chosen }, chosen);
      return replySuccess(interaction, {
        title: t('SETTINGS.title', {}, chosen),
        description: confirm
      });
    } catch (err) {
      logger.error('[settings] locale command error', err);
      return replyError(interaction, 'ERRORS.generic');
    }
  }
};
