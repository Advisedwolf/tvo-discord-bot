// src/commands/admin/perms.js
import { SlashCommandBuilder } from 'discord.js';
import { getService } from '../../services/servicesRegistry.js';
import { replyError, replySuccess } from '../../utils/replyHelpers.js';
import logger from '../../utils/logger.js';
import { t } from '../../utils/translator.js';

export default {
  data: new SlashCommandBuilder()
    .setName('perms')
    .setDescription('Manage command permissions')
    .addSubcommand(sub =>
      sub
        .setName('list')
        .setDescription('List current role assignments per command')
    )
    .addSubcommand(sub =>
      sub
        .setName('add')
        .setDescription('Grant a role permission for a command')
        .addStringOption(opt =>
          opt
            .setName('command')
            .setDescription('Command name (e.g. ping)')
            .setRequired(true)
        )
        .addRoleOption(opt =>
          opt
            .setName('role')
            .setDescription('Role to grant')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('remove')
        .setDescription('Revoke a role’s permission for a command')
        .addStringOption(opt =>
          opt
            .setName('command')
            .setDescription('Command name (e.g. ping)')
            .setRequired(true)
        )
        .addRoleOption(opt =>
          opt
            .setName('role')
            .setDescription('Role to revoke')
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;
    const sub = interaction.options.getSubcommand();
    const permissionService = getService('admin/permissionservice');

    try {
      switch (sub) {
        case 'list': {
          const guildId = interaction.guild.id;
          const profile = await permissionService.getProfile(guildId);
          let desc = '';
          for (const [cmd, roleIds] of profile.commands.entries()) {
            // roleIds may be an array or other type
            let namesText;
            if (Array.isArray(roleIds) && roleIds.length) {
              const names = roleIds.map(id => interaction.guild.roles.cache.get(id)?.name || id);
              namesText = names.join(', ');
            } else {
              namesText = t('PERMS.everyone');
            }
            desc += `**/${cmd}**: ${namesText}
`;
          }
          return replySuccess(interaction, {
            title: t('PERMS.listTitle'),
            description: desc || t('PERMS.noneConfigured')
          });
        }
        case 'add': {
          const command = interaction.options.getString('command', true);
          const role = interaction.options.getRole('role', true);
          await permissionService.grantRole(command, interaction.guild.id, role.id);
          return replySuccess(interaction, {
            title: t('PERMS.addSuccessTitle', { command }),
            description: t('PERMS.addSuccessDesc', { role: role.name, command })
          });
        }
        case 'remove': {
          const command = interaction.options.getString('command', true);
          const role = interaction.options.getRole('role', true);
          await permissionService.revokeRole(command, interaction.guild.id, role.id);
          return replySuccess(interaction, {
            title: t('PERMS.removeSuccessTitle', { command }),
            description: t('PERMS.removeSuccessDesc', { role: role.name, command })
          });
        }
      }
    } catch (err) {
      logger.error('[perms command] Error in subcommand', err);
      return replyError(interaction, 'ERRORS.generic');
    }
  }
};
