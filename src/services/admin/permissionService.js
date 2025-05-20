// src/services/admin/permissionService.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../../utils/logger.js';
import { t } from '../../utils/translator.js';
import { replyError } from '../../utils/replyHelpers.js';
import PermissionProfile from '../../models/PermissionProfile.js';
import { getService } from '../servicesRegistry.js';

// derive __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const configPath = path.join(__dirname, '../../config/permissions.json');

class PermissionService {
  /** Retrieve or create the PermissionProfile for a guild */
  async getProfile(guildId) {
    const doc = await PermissionProfile.findOneAndUpdate(
      { guildId },
      {},
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return doc;
  }

  /** Seed a fresh profile for a guild, adding only new commands */
  async seedDefaults(guildId) {
    // Live-reload the defaults JSON
    let defaults = {};
    try {
      const raw = fs.readFileSync(configPath, 'utf-8');
      defaults = JSON.parse(raw);
      logger.info('[permissionService] Reloaded defaults from permissions.json');
    } catch (err) {
      logger.error('[permissionService] Could not reload defaults', err);
    }

    const doc = await this.getProfile(guildId);
    const assetSvcFactory = getService('admin/assetservice');
    const assetSvc        = assetSvcFactory(this.client);

    // Add only commands not already in the DB
    for (const [cmd, roleNames] of Object.entries(defaults)) {
      if (!doc.commands.has(cmd)) {
        const roleIds = await Promise.all(
          roleNames.map(name => assetSvc.getRoleId(guildId, name))
        );
        doc.commands.set(cmd, roleIds.filter(Boolean));
        logger.info(
          `[permissionService] Added default for new command "${cmd}" in guild ${guildId}`
        );
      }
    }

    await doc.save();
    logger.info(`[permissionService] Seeded defaults for guild ${guildId}`);
    return doc;
  }

  /** Check whether this interaction’s member has any of the allowed roles */
  async canExecute(interaction) {
    try {
      const guildId     = interaction.guild.id;
      const memberRoles = interaction.member.roles.cache.map(r => r.id);
      const doc         = await this.getProfile(guildId);
      const allowed     = doc.commands.get(interaction.commandName) || [];
      return memberRoles.some(r => allowed.includes(r));
    } catch (err) {
      logger.error('[permissionService] canExecute error', err);
      await replyError(interaction, 'ERRORS.generic');
      return false;
    }
  }

  /** Grant a role permission for a specific command */
  async grantRole(command, guildId, roleId) {
    const doc = await this.getProfile(guildId);
    const current = doc.commands.get(command) || [];
    if (!current.includes(roleId)) {
      current.push(roleId);
      doc.commands.set(command, current);
      await doc.save();
      logger.info(`[permissionService] Granted role ${roleId} for /${command} in guild ${guildId}`);
    }
    return doc;
  }

  /** Revoke a role’s permission for a specific command */
  async revokeRole(command, guildId, roleId) {
    const doc = await this.getProfile(guildId);
    const current = doc.commands.get(command) || [];
    const updated = current.filter(r => r !== roleId);
    doc.commands.set(command, updated);
    await doc.save();
    logger.info(`[permissionService] Revoked role ${roleId} for /${command} in guild ${guildId}`);
    return doc;
  }
}

// Export a singleton; client injected in index.js
const svc = new PermissionService();
export default svc;
