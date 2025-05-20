// src/commands/dev/translateTest.js
import { SlashCommandBuilder } from 'discord.js';
import { t } from '../../utils/translator.js';
import { replySuccess } from '../../utils/replyHelpers.js';

export default {
  data: new SlashCommandBuilder()
    .setName('translate-test')
    .setDescription('Test any locale/key combo')
    .addStringOption(o => 
      o.setName('locale')
       .setDescription('Locale code (e.g. fr, es)')
       .setRequired(true))
    .addStringOption(o => 
      o.setName('key')
       .setDescription('Translation key (e.g. COMMANDS.ping.success)')
       .setRequired(true)),
  async execute(interaction) {
    const locale = interaction.options.getString('locale', true);
    const key    = interaction.options.getString('key', true);
    const msg    = t(key, {}, locale) || `❓ missing ${key}`;
    return replySuccess(interaction, {
      title: `Test [${locale}] ${key}`,
      description: msg
    });
  }
};