import { SlashCommandBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { DateTime } from 'luxon';

import { t } from '../../utils/translator.js';
import { replySuccess, replyError } from '../../utils/replyHelpers.js';

import dateTimePicker from '../../services/functions/dateTimePickerService.js';
import reminderService from '../../services/Scheduler/reminderService.js';

// Load your reminder categories JSON
const categories = JSON.parse(
  fs.readFileSync(
    new URL('../../config/Inputs/reminderCategories.json', import.meta.url),
    'utf-8'
  )
);

export default {
  data: new SlashCommandBuilder()
    .setName('remind')
    .setDescription(t('COMMANDS.remind.description'))
    .addStringOption(opt =>
      opt
        .setName('category')
        .setDescription(t('COMMANDS.remind.categoryDesc'))
        .setRequired(true)
        .addChoices(
          ...Object.entries(categories).map(([key, label]) => ({
            name: t(`CATEGORIES.${key}`, { default: label }),
            value: key
          }))
        )
    )
    .addStringOption(opt =>
      opt
        .setName('message')
        .setDescription(t('COMMANDS.remind.messageDesc'))
        .setRequired(true)
    )
    .setDMPermission(true),

  async execute(interaction) {
    try {
      // defer with a flag, not deprecated `ephemeral: true`
      await interaction.deferReply({ flags: 64 });

      const category = interaction.options.getString('category');
      const message  = interaction.options.getString('message');

      // step into your date/time picker
      const pickedDate = await dateTimePicker.pickDateTime(interaction, {
        prompt: t('COMMANDS.remind.pickDateTime'),
        defaultDate: new Date()
      });

      // schedule in MongoDB
      const reminder = await reminderService.scheduleOneOff({
        guildId:   interaction.guild.id,
        userId:    interaction.user.id,
        channelId: interaction.channelId,
        category,
        message,
        date:      pickedDate
      });

      // format for the user’s locale
      const formatted = DateTime.fromJSDate(pickedDate)
        .setZone(interaction.user.locale || 'UTC')
        .toLocaleString(DateTime.DATETIME_FULL);

      return interaction.editReply({
        embeds: [
          {
            title:       t('COMMANDS.remind.successTitle'),
            description: t('COMMANDS.remind.successDescription', {
              id:   reminder._id,
              time: formatted
            }),
            color: 0x00AA00
          }
        ],
        components: []
      });
    } catch (err) {
      console.error(`[/remind] error:`, err);
      return replyError(interaction, 'COMMANDS.remind.error.failed');
    }
  }
};
