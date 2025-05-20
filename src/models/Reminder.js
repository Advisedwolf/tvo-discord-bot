import { Schema, model } from 'mongoose';

const reminderSchema = new Schema({
  guildId:    { type: String, required: true },
  userId:     { type: String, required: true },
  channelId:  { type: String, required: true },
  category:   { type: String, default: 'general' },
  message:    { type: String, required: true },
  remindAt:   { type: Date,   required: true },
  status:     {
    type: String,
    enum: ['pending','sent','cancelled'],
    default: 'pending'
  },
  type:       {
    type: String,
    enum: ['one-off','recurring'],
    default: 'one-off'
  },
  meta:       { type: Schema.Types.Mixed },
  createdAt:  { type: Date, default: () => new Date() }
});

// Index to speed up due‐reminder queries
reminderSchema.index({ remindAt: 1, status: 1 });

export default model('Reminder', reminderSchema);

