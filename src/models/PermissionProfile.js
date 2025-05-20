// src/models/PermissionProfile.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const PermissionProfileSchema = new Schema({
  guildId:    { type: String, required: true, index: true },
  commands:   { type: Map, of: [String], default: {} }, // Map<commandName, [roleId]>
}, {
  timestamps: true
});

// unique per guildId
PermissionProfileSchema.index({ guildId: 1 }, { unique: true });

export default mongoose.model('PermissionProfile', PermissionProfileSchema);
