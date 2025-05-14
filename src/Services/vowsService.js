// src/services/vowsService.js
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} = require('discord.js');
const logger = require('../utils/logger');
const translator = require('../utils/translator');
const UserProfile = require('../models/UserProfile');

async function presentVows(user) {
  const locale = user.locale || 'en';
  const dm = await user.createDM();

  // 1) VOWS Embed
  const vowsEmbed = new EmbedBuilder()
    .setTitle(translator.t('vows.title', locale))                 // “📜 VOWS OF THE ORDER”
    .setDescription(translator.t('vows.subtitle', locale))         // “When you raise our banner…”
    .addFields(
      { name: '🛡️ ' + translator.t('vows.respect.title', locale),
        value: translator.t('vows.respect.desc', locale) },
      { name: '⚔️ ' + translator.t('vows.growth.title', locale),
        value: translator.t('vows.growth.desc', locale) },
      { name: '📣 ' + translator.t('vows.engagement.title', locale),
        value: translator.t('vows.engagement.desc', locale) },
      { name: '🤝 ' + translator.t('vows.teamwork.title', locale),
        value: translator.t('vows.teamwork.desc', locale) },
      { name: '🔥 ' + translator.t('vows.commitment.title', locale),
        value: translator.t('vows.commitment.desc', locale) }
    )
    // If you want your attached image:
    // .setImage('attachment://vows-banner.png')
    .setColor('Blue');

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('consent_vows')
      .setLabel(translator.t('vows.agree', locale))           // “I Agree”
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('decline_vows')
      .setLabel(translator.t('vows.decline', locale))         // “I Decline”
      .setStyle(ButtonStyle.Danger)
  );

  await dm.send({ embeds: [vowsEmbed], components: [row] });
  logger.debug(`Sent VOWs embed to ${user.tag}`, 'vows');

  // 2) Wait for their click
  const interaction = await dm.awaitMessageComponent({
    componentType: ComponentType.Button,
    filter: i => i.user.id === user.id && ['consent_vows','decline_vows'].includes(i.customId),
    time: 120_000
  });

  if (interaction.customId === 'decline_vows') {
    await interaction.update({
      content: translator.t('vows.declined', locale),
      components: []
    });
    throw new Error('User declined the VOWs');
  }

  // 3) They agreed!
  await interaction.update({
    content: translator.t('vows.confirmed', locale),
    components: []
  });
  logger.info(`${user.tag} agreed to the VOWs`, 'vows');

  // 4) Persist to profile
  const profile = await UserProfile.findOne({ userId: user.id });
  profile.vows = true;
  await profile.save();

  // 5) Now present the Code of Conduct
  await presentCodeOfConduct(user, locale);
}

async function presentCodeOfConduct(user, locale) {
  const dm = await user.createDM();

  const cocEmbed = new EmbedBuilder()
    .setTitle(translator.t('coc.title', locale))                  // “⚖️ CODE OF CONDUCT”
    .setDescription(translator.t('coc.subtitle', locale))          // “We are disciplined…”
    .addFields(
      { name: '🔇 ' + translator.t('coc.respect.title', locale),
        value: translator.t('coc.respect.desc', locale) },
      { name: '🪖 ' + translator.t('coc.discipline.title', locale),
        value: translator.t('coc.discipline.desc', locale) },
      { name: '🧠 ' + translator.t('coc.engagement.title', locale),
        value: translator.t('coc.engagement.desc', locale) },
      { name: '🛡️ ' + translator.t('coc.defend.title', locale),
        value: translator.t('coc.defend.desc', locale) },
      { name: '⚙️ ' + translator.t('coc.donate.title', locale),
        value: translator.t('coc.donate.desc', locale) },
      { name: '🏹 ' + translator.t('coc.events.title', locale),
        value: translator.t('coc.events.desc', locale) }
    )
    .setColor('Gold');

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('consent_coc')
      .setLabel(translator.t('coc.agree', locale))
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('decline_coc')
      .setLabel(translator.t('coc.decline', locale))
      .setStyle(ButtonStyle.Danger)
  );

  await dm.send({ embeds: [cocEmbed], components: [row] });
  logger.debug(`Sent Code of Conduct embed to ${user.tag}`, 'vows');

  const interaction = await dm.awaitMessageComponent({
    componentType: ComponentType.Button,
    filter: i => i.user.id === user.id && ['consent_coc','decline_coc'].includes(i.customId),
    time: 120_000
  });

  if (interaction.customId === 'decline_coc') {
    await interaction.update({
      content: translator.t('coc.declined', locale),
      components: []
    });
    throw new Error('User declined the Code of Conduct');
  }

  await interaction.update({
    content: translator.t('coc.confirmed', locale),
    components: []
  });
  logger.info(`${user.tag} agreed to the Code of Conduct`, 'vows');

  const profile = await UserProfile.findOne({ userId: user.id });
  profile.codeOfConduct = true;
  await profile.save();
}

module.exports = { presentVows };
