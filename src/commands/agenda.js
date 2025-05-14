// src/commands/agenda.js
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require('discord.js');
const logger = require('../utils/logger');
const { t } = require('../utils/translator');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('agenda')
    .setDescription(t('agenda.commandDesc', 'en'))
    .addSubcommand(sub =>
      sub
        .setName('add')
        .setDescription(t('agenda.addDescription', 'en'))
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const locale = interaction.locale || 'en';

    if (sub === 'add') {
      logger.debug(
        `Executing /agenda add for user ${interaction.user.tag}`,
        'commands'
      );

      const modal = new ModalBuilder()
        .setCustomId('agenda_add_modal')
        .setTitle(t('agenda.modal.title', locale));

      const fields = [
        { id: 'topic', style: TextInputStyle.Short },
        { id: 'description', style: TextInputStyle.Paragraph },
        { id: 'assignee', style: TextInputStyle.Short },
        { id: 'due', style: TextInputStyle.Short },
        { id: 'priority', style: TextInputStyle.Short },
        { id: 'category', style: TextInputStyle.Short }
      ];

      for (const { id, style } of fields) {
        const input = new TextInputBuilder()
          .setCustomId(`agenda_${id}`)
          .setLabel(t(`agenda.modal.${id}`, locale))
          .setStyle(style)
          .setRequired(id !== 'due');

        modal.addComponents(
          new ActionRowBuilder().addComponents(input)
        );
      }

      await interaction.showModal(modal);
      logger.debug(
        `Displayed agenda add modal to ${interaction.user.tag}`,
        'commands'
      );
    }
  }
};

