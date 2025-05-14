// src/commands/cbsp.js
const { SlashCommandBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const CBSPFarm = require('../models/CBSPFarm');
const UserProfile = require('../models/UserProfile');
const logger = require('../utils/logger');
const translator = require('../utils/translator');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cbsp')
    .setDescription(translator.t('cbsp.commandDesc', 'en'))
    .addSubcommand(sub =>
      sub.setName('join').setDescription(translator.t('cbsp.joinDesc', 'en'))
    )
    .addSubcommand(sub =>
      sub.setName('cleanme').setDescription(translator.t('cbsp.cleanDesc', 'en'))
    )
    .addSubcommand(sub =>
      sub.setName('pushme').setDescription(translator.t('cbsp.pushDesc', 'en'))
    ),

  async execute(interaction) {
    const locale = interaction.locale?.split('-')[0] || 'en';
    const sub = interaction.options.getSubcommand();
    logger.debug(`Executing /cbsp ${sub} by ${interaction.user.tag}`, 'commands');

    if (sub === 'join') return handleJoin(interaction, locale);
    if (sub === 'cleanme') return handleCleanMe(interaction, locale);
    if (sub === 'pushme') return handlePushMe(interaction, locale);
  }
};

async function handleJoin(interaction, locale) {
  const dm = await interaction.user.createDM();
  logger.debug(`Sent CBSP onboarding DM to ${interaction.user.tag}`, 'commands');

  const embed = new EmbedBuilder()
    .setTitle(translator.t('cbsp.onboardingTitle', locale))
    .addFields(
      { name: translator.t('cbsp.overviewLabel', locale), value: translator.t('cbsp.intro', locale) },
      { name: translator.t('cbsp.rulesLabel', locale), value: translator.t('cbsp.howItWorks', locale) },
      { name: translator.t('cbsp.benefitsLabel', locale), value: translator.t('cbsp.whyJoin', locale) },
      { name: translator.t('cbsp.nextStepsLabel', locale), value: translator.t('cbsp.gettingStarted', locale) }
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('consent_cbsp')
      .setLabel(translator.t('cbsp.joinConfirm', locale))
      .setStyle(ButtonStyle.Success)
  );

  await dm.send({ embeds: [embed], components: [row] });
  await interaction.reply({ content: translator.t('cbsp.joinCheckDm', locale), ephemeral: true });

  const filter = i => i.user.id === interaction.user.id && i.customId === 'consent_cbsp';
  const collector = dm.createMessageComponentCollector({ filter, max: 1, time: 120000 });

  collector.on('collect', async i => {
    await i.deferUpdate();
    const member = await interaction.guild.members.fetch(i.user.id);
    await member.roles.add(process.env.CBSP_ROLE_ID);

    let profile = await UserProfile.findOne({ userId: i.user.id });
    if (!profile) profile = new UserProfile({ userId: i.user.id });
    profile.cbsp = { registered: true };
    await profile.save();

    logger.info(`${interaction.user.tag} joined CBSP`, 'commands');
    await dm.send(translator.t('cbsp.enterCastle', locale));

    const msgCollector = dm.createMessageCollector({ filter: m => m.author.id === i.user.id, max: 1, time: 120000 });
    msgCollector.on('collect', async m => {
      const [castleName, coords] = m.content.trim().split(/\s+/);
      await CBSPFarm.updateOne(
        { userId: i.user.id },
        { castleName, coords, joinedAt: new Date() },
        { upsert: true }
      );

      const announceChannel = await interaction.guild.channels.fetch(process.env.CBSP_ANNOUNCE_CHANNEL_ID);
      await announceChannel.send(
        translator.t('cbsp.joinAnnounce', locale, { username: i.user.username, castleName, coords })
      );

      await dm.send(translator.t('cbsp.joinThanks', locale));
    });
  });
}

async function handleCleanMe(interaction, locale) {
  await interaction.reply({ content: translator.t('cbsp.cleanRequestDm', locale), ephemeral: true });
  logger.debug(`CleanMe request acknowledged for ${interaction.user.tag}`, 'commands');

  const farm = await CBSPFarm.findOne({ userId: interaction.user.id });
  const hub = await interaction.guild.channels.fetch(process.env.CBSP_HUB_CHANNEL_ID);

  const timestamp = new Date().toLocaleString();
  const post = await hub.send(
    translator.t('cbsp.cleanPost', locale, { username: interaction.user.username, coords: farm.coords, timestamp })
  );

  logger.info(`Clean request posted for ${interaction.user.tag}`, 'commands');
  await post.react('✅');

  const reactFilter = async (reaction, user) => {
    const member = await reaction.message.guild.members.fetch(user.id);
    return reaction.emoji.name === '✅' && member.roles.cache.has(process.env.CBSP_CLEANER_ROLE_ID);
  };

  const collector = post.createReactionCollector({ filter: reactFilter, max: 1, time: 86400000 });
  collector.on('collect', async () => {
    setTimeout(() => post.delete().catch(() => {}), 10000);
    farm.lastCleaned = Date.now();
    await farm.save();

    const hubChannel = await interaction.guild.channels.fetch(process.env.CBSP_HUB_CHANNEL_ID);
    await hubChannel.send(
      translator.t('cbsp.cleanConfirm', locale, { username: interaction.user.username, date: new Date().toLocaleDateString() })
    );
  });
}

async function handlePushMe(interaction, locale) {
  const dm = await interaction.user.createDM();
  logger.debug(`Started push request flow for ${interaction.user.tag}`, 'commands');

  await interaction.deferReply({ ephemeral: true });
  await dm.send(translator.t('cbsp.pushPromptBuilding', locale));

  const filter = m => m.author.id === interaction.user.id;
  const col1 = dm.createMessageCollector({ filter, max: 1, time: 120000 });

  col1.on('collect', async m1 => {
    const building = m1.content.trim();
    logger.debug(`Push request building: ${building}`, 'commands');

    await dm.send(translator.t('cbsp.pushPromptAmount', locale));
    const col2 = dm.createMessageCollector({ filter, max: 1, time: 120000 });

    col2.on('collect', async m2 => {
      const amount = m2.content.trim();
      logger.debug(`Push request amount: ${amount}`, 'commands');

      const thread = await interaction.guild.channels.fetch(process.env.CBSP_PUSH_CHANNEL_ID);
      const embed = new EmbedBuilder()
        .setTitle(translator.t('cbsp.pushRequestTitle', locale))
        .addFields(
          { name: translator.t('cbsp.userLabel', locale), value: interaction.user.username, inline: true },
          { name: translator.t('cbsp.buildingLabel', locale), value: building, inline: true },
          { name: translator.t('cbsp.amountLabel', locale), value: amount, inline: true },
          { name: translator.t('cbsp.statusLabel', locale), value: translator.t('cbsp.statusAwaiting', locale), inline: false }
        )
        .setTimestamp();

      const request = await thread.send({ embeds: [embed] });
      await request.react('✅');
      await dm.send(translator.t('cbsp.pushAnnounceDm', locale));
      logger.info(`Push request posted for ${interaction.user.tag}`, 'commands');

      const approveFilter = async (reaction, user) => {
        if (reaction.emoji.name !== '✅') return false;
        const member = await reaction.message.guild.members.fetch(user.id);
        return member.roles.cache.has(process.env.CBSP_CLEANER_ROLE_ID);
      };

      const approvalCollector = request.createReactionCollector({ filter: approveFilter, max: 1, time: 86400000 });
      approvalCollector.on('collect', async () => {
        const updatedEmbed = EmbedBuilder.from(request.embeds[0])
          .spliceFields(3, 1, { name: translator.t('cbsp.statusLabel', locale), value: translator.t('cbsp.statusActive', locale), inline: false });
        await request.edit({ embeds: [updatedEmbed] });
        logger.info(`Push activated for ${interaction.user.tag}`, 'commands');

        const userDm = await interaction.client.users.fetch(interaction.user.id);
        await userDm.send(translator.t('cbsp.pushActiveDm', locale, { building }));
        logger.info(`Push activation DM sent to ${interaction.user.tag}`, 'commands');

        const confirmCollector = request.createReactionCollector({ filter: (r,u) => r.emoji.name === '✅' && u.id === interaction.user.id, max:1, time:86400000 });
        confirmCollector.on('collect', async () => {
          const finalEmbed = EmbedBuilder.from(request.embeds[0])
            .spliceFields(3, 1, { name: translator.t('cbsp.statusLabel', locale), value: translator.t('cbsp.statusCompleted', locale), inline: false });
          await request.edit({ embeds: [finalEmbed] });
          await thread.send(translator.t('cbsp.pushComplete', locale, { username: interaction.user.username }));
          await request.delete().catch(() => {});
        });
      });
    });
  });
}
