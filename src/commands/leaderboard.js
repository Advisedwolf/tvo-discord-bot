// src/commands/leaderboard.js
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { getTopEntries } = require('../utils/points');
const logger = require('../utils/logger');
const translator = require('../utils/translator');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription(translator.t('leaderboard.commandDesc', 'en'))
    .addIntegerOption(opt =>
      opt
        .setName('count')
        .setDescription(translator.t('leaderboard.optionCountDesc', 'en'))
        .setRequired(false)
    ),

  async execute(interaction) {
    const locale = interaction.locale?.split('-')[0] || 'en';
    const count = interaction.options.getInteger('count') || 10;
    logger.info(
      `Executing /leaderboard by ${interaction.user.tag} with count=${count}`,
      'commands'
    );

    const entries = await getTopEntries(count);
    if (!entries.length) {
      logger.debug(
        `No leaderboard data available for ${interaction.user.tag}`,
        'commands'
      );
      return interaction.reply({
        content: translator.t('leaderboard.noData', locale),
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(translator.t('leaderboard.title', locale, { count: entries.length }))
      .setTimestamp();

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const user = await interaction.client.users.fetch(entry.userId).catch(() => null);
      const name = user ? user.username : entry.userId;

      embed.addFields({
        name: `#${i + 1} ${name}`,
        value: translator.t('leaderboard.pointsField', locale, { points: entry.points }),
        inline: false
      });

      logger.debug(
        `Rank #${i + 1}: ${name} - ${entry.points} pts`,
        'commands'
      );
    }

    logger.info(
      `Leaderboard sent to ${interaction.user.tag}`,
      'commands'
    );

    await interaction.reply({ embeds: [embed] });
  }
};

