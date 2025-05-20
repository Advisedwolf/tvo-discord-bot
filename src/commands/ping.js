import { SlashCommandBuilder } from 'discord.js';
import { t } from '../utils/translator.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),
  async execute(interaction) {
    // Determine locale
    const locale =
      interaction.userProfile?.locale ||
      interaction.locale ||
      'en';
    // Translate directly
    const message = t('ping.success', {}, locale);

    // Plain-text ephemeral reply
    return interaction.reply({ content: message, flags: 64 });
  }
};
