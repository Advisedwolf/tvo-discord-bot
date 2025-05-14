// src/services/alertsOnboardingService.js
// Consolidated alerts subscription form during onboarding

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} = require('discord.js');
const logger = require('../utils/logger');
const translator = require('../utils/translator');

// Role IDs from environment
const {
  SCOUT_ALERT_ROLE_ID,
  ATTACK_ALERT_ROLE_ID,
  EVENT_ALERT_ROLE_ID,
  ALERT_WATCH_ROLE_ID
} = process.env;

const ALERT_TYPES = [
  { key: 'scout', labelKey: 'alerts.scoutLabel', roleId: SCOUT_ALERT_ROLE_ID },
  { key: 'attack', labelKey: 'alerts.attackLabel', roleId: ATTACK_ALERT_ROLE_ID },
  { key: 'event', labelKey: 'alerts.eventLabel', roleId: EVENT_ALERT_ROLE_ID }
];

/**
 * Presents a unified alerts subscription form with Join/Abstain per alert and a Proceed button.
 * @param {Interaction} interaction - The onboarding interaction (for locale & guild)
 */
async function presentAlertsForm(interaction) {
  const user = interaction.user;
  const guild = interaction.guild;
  const member = await guild.members.fetch(user.id);
  const locale = interaction.locale?.split('-')[0] || 'en';

  // Track user choices
  const choices = { scout: null, attack: null, event: null };

  // Helper to build components based on current choices
  function buildComponents() {
    const rows = [];
    // One row per alert type
    for (const { key, labelKey } of ALERT_TYPES) {
      const joined = choices[key] === true;
      const abstained = choices[key] === false;
      const joinBtn = new ButtonBuilder()
        .setCustomId(`onboard_alert_${key}_join`)
        .setLabel(translator.t('alerts.join', locale))
        .setStyle(joined ? ButtonStyle.Success : ButtonStyle.Primary)
        .setDisabled(abstained || joined);
      const abstainBtn = new ButtonBuilder()
        .setCustomId(`onboard_alert_${key}_abstain`)
        .setLabel(translator.t('alerts.abstain', locale))
        .setStyle(abstained ? ButtonStyle.Danger : ButtonStyle.Secondary)
        .setDisabled(joined || abstained);
      rows.push(new ActionRowBuilder().addComponents(joinBtn, abstainBtn));
    }

    // Proceed button
    const allAnswered = Object.values(choices).every(v => v !== null);
    const proceedBtn = new ButtonBuilder()
      .setCustomId('onboard_alert_proceed')
      .setLabel(translator.t('alerts.proceed', locale))
      .setStyle(ButtonStyle.Success)
      .setDisabled(!allAnswered);
    rows.push(new ActionRowBuilder().addComponents(proceedBtn));

    return rows;
  }

  // Create initial embed and form
  const embed = new EmbedBuilder()
    .setTitle(translator.t('alerts.formTitle', locale))
    .setDescription(translator.t('alerts.benefits', locale));

  const message = await user.send({
    embeds: [embed],
    components: buildComponents()
  });
  logger.debug(`Sent alerts form to ${user.tag}`, 'onboarding');

  // Collector for button interactions
  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 300000
  });

  collector.on('collect', async i => {
    if (i.user.id !== user.id) return;
    const [ , , type, action ] = i.customId.split('_'); // onboard_alert_{type}_{action}
    if (type === 'alert' && action === 'proceed') {
      // Save roles
      let anyJoined = false;
      for (const { key, roleId } of ALERT_TYPES) {
        if (choices[key]) {
          await member.roles.add(roleId);
          anyJoined = true;
        }
      }
      if (anyJoined) {
        await member.roles.add(ALERT_WATCH_ROLE_ID).catch(() => {});
      }
      await i.update({
        content: translator.t('alerts.confirmProceed', locale),
        embeds: [],
        components: []
      });
      collector.stop();
      logger.info(`Alerts choices saved for ${user.tag}`, 'onboarding');
    } else {
      // Join or abstain button
      if (action === 'join') choices[type] = true;
      if (action === 'abstain') choices[type] = false;
      await i.update({ components: buildComponents() });
    }
  });
}

module.exports = { presentAlertsForm };
