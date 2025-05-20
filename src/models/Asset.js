import mongoose from 'mongoose';

const AssetSchema = new mongoose.Schema({
  id:         { type: String, required: true },
  guildId:    { type: String, required: true },
  name:       String,
  parentId:   String,
  position:   Number,
  type:       String,                   // "category" | "channel" | "thread" | "role"
  permissions:{ type: mongoose.Schema.Types.Mixed },
  fetchedAt:  { type: Date, default: Date.now }
});

// unique per guild+asset
AssetSchema.index({ guildId: 1, id: 1 }, { unique: true });

// upsert a channel or thread
AssetSchema.statics.upsertChannel = function (guildId, channel) {
  // grab the @everyone permission bitfield for this channel
  const permBF = channel.permissionsFor(channel.guild.id)?.bitfield ?? 0;

  return this.findOneAndUpdate(
    { guildId, id: channel.id },
    {
      guildId,
      id:         channel.id,
      name:       channel.name,
      parentId:   channel.parentId?.toString() || null,
      position:   channel.position,
      type:       channel.isThread() ? 'thread' : 'channel',
      permissions: permBF,
      fetchedAt:  new Date()
    },
    { upsert: true, new: true }
  );
};

// upsert a role
AssetSchema.statics.upsertRole = function (guildId, role) {
  return this.findOneAndUpdate(
    { guildId, id: role.id },
    {
      guildId,
      id:         role.id,
      name:       role.name,
      parentId:   null,
      position:   role.position,
      type:       'role',
      permissions: role.permissions.bitfield,
      fetchedAt:  new Date()
    },
    { upsert: true, new: true }
  );
};

export default mongoose.model('Asset', AssetSchema);
