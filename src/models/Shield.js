const mongoose = require('mongoose');

const ShieldSchema = new mongoose.Schema({
  playerId:        { type: String, required: true },
  playerLocale:    { type: String, required: true },
  location:        { type: String, required: true },
  startTime:       { type: Date,   required: true },
  endTime:         { type: Date,   required: true },
  // no longer required on creation; we'll fill it in after posting the embed
  messageId:       { type: String, default: '' },
  reactedUserIds:  { type: [String], default: [] },
  lastStatus:      { type: String, required: true, enum: ['active','ending','expired'] },
  warned15min:     { type: Boolean, default: false }
});

module.exports = mongoose.model('Shield', ShieldSchema);

