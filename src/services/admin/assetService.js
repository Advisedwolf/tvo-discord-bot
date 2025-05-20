// src/services/functions/assetService.js
import { Collection } from 'discord.js';
import AssetModel from '../../models/Asset.js';    // ← fixed path

const ONE_HOUR = 1000 * 60 * 60;

class AssetService {
  constructor(client) {
    this.client   = client;
    this.cache    = new Map(); // guildId → { channels: Map<name, id>, roles: Map<name, id> }
    this.expires  = new Map(); // guildId → timestamp
  }

  async syncGuild(guild) {
    // 1) Fetch from Discord
    const [channels, roles] = await Promise.all([
      guild.channels.fetch(),
      guild.roles.fetch()
    ]);

    // 2) Persist to Mongo
    const upserts = [];
    channels.each(c => upserts.push(AssetModel.upsertChannel(guild.id, c)));
    roles.each(r    => upserts.push(AssetModel.upsertRole(   guild.id, r)));
    await Promise.all(upserts);

    // 3) Rebuild in-memory cache
    this.cache.set(guild.id, {
      channels: new Map(channels.map(c => [c.name, c.id])),
      roles:    new Map(roles.map(r    => [r.name,    r.id]))
    });
    this.expires.set(guild.id, Date.now() + ONE_HOUR);
  }

  async _ensure(guildId) {
    const expiry = this.expires.get(guildId) || 0;
    if (Date.now() > expiry) {
      const guild = this.client.guilds.cache.get(guildId);
      if (guild) {
        await this.syncGuild(guild);
      }
    }
  }

  async getChannelId(guildId, name) {
    await this._ensure(guildId);
    return this.cache.get(guildId)?.channels.get(name) || null;
  }

  async getRoleId(guildId, name) {
    await this._ensure(guildId);
    return this.cache.get(guildId)?.roles.get(name) || null;
  }
}

export default function initAssetService(client) {
  const svc = new AssetService(client);

  // initial full‐guild sync once on ready
  client.once('ready', async () => {
    for (const g of client.guilds.cache.values()) {
      await svc.syncGuild(g);
      console.log(`[assetService] Synced ${g.id}`);
    }
  });

  return svc;
}

