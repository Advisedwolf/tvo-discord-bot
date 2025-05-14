const mongoose = require('mongoose');

const LeaderboardEntrySchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  points: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('LeaderboardEntry', LeaderboardEntrySchema);