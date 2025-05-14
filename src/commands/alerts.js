// src/commands/alerts.js
const { SlashCommandBuilder } = require('discord.js');
const UserProfile = require('../models/UserProfile');
const logger = require('../utils/logger');
const translator = require('../utils/translator');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('alerts')
    .setDescription(translator.t('alerts.commandDesc', 'en'))
    .addSubcommand(sub =>
      sub
        .setName('subscribe')
        .setDescription(translator.t('alerts.subscribeDesc', 'en'))
        .addStringOption(opt =>
          opt
            .setName('type')
            .setDescription(translator.t('alerts.typeDesc', 'en'))
            .setRequired(true)
            .addChoices(
              { name: 'Scout', value: 'scout' },
              { name: 'Attack', value: 'attack' },
              { name: 'Event', value: 'event' }
            )
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('unsubscribe')
        .setDescription(translator.t('alerts.unsubscribeDesc', 'en'))
        .addStringOption(opt =>
          opt
            .setName('type')
            .setDescription(translator.t('alerts.typeDesc', 'en'))
            .setRequired(true)
            .addChoices(
              { name: 'Scout', value: 'scout' },
              { name: 'Attack', value: 'attack' },
              { name: 'Event', value: 'event' }
            )
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('list')
        .setDescription(translator.t('alerts.listDesc', 'en'))
    ),

  async execute(interaction) {
    const locale = interaction.locale || 'en';
    const sub = interaction.options.getSubcommand();
    const type = interaction.options.getString('type');
    logger.debug(
      `Executing /alerts ${sub} by ${interaction.user.tag}`,
      'commands'
    );

    let profile = await UserProfile.findOne({ userId: interaction.user.id });
    if (!profile) profile = new UserProfile({ userId: interaction.user.id });

    const roleMap = {
      scout: '1369672641283231846',
      attack: '1369685492919959653',
      event: '1369730477694386297'
    };
    const alertWatchRole = '1369660860322152598';

    if (sub === 'list') {
      const subs = Object.entries(profile.alertSubscriptions || {})
        .filter(([, enabled]) => enabled)
        .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1));
      logger.debug(
        `Listing alerts for ${interaction.user.tag}: ${subs.join(', ') || 'None'}`,
        'commands'
      );
      const content = subs.length
        ? translator.t('alerts.listSome', locale, { list: subs.join(', ') })
        : translator.t('alerts.listNone', locale);
      return interaction.reply({ content, ephemeral: true });
    }

    const isSubscribe = sub === 'subscribe';
    profile.alertSubscriptions = profile.alertSubscriptions || {};
    profile.alertSubscriptions[type] = isSubscribe;
    profile.alertSubscriptionsGlobal = Object.values(profile.alertSubscriptions).some(v => v);
    await profile.save();

    logger.debug(
      `${interaction.user.tag} ${isSubscribe ? 'subscribed to' : 'unsubscribed from'} ${type}`,
      'commands'
    );

    const member = interaction.member;
    if (isSubscribe) await member.roles.add(roleMap[type]);
    else await member.roles.remove(roleMap[type]);

    if (profile.alertSubscriptionsGlobal) await member.roles.add(alertWatchRole).catch(() => {});
    else await member.roles.remove(alertWatchRole).catch(() => {});

    const confirmKey = isSubscribe ? 'alerts.subscribeConfirm' : 'alerts.unsubscribeConfirm';
    const content = translator.t(confirmKey, locale, { type: type.charAt(0).toUpperCase() + type.slice(1) });
    return interaction.reply({ content, ephemeral: true });
  }
};
