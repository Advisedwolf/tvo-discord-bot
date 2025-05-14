const LeaderboardEntry = require('../models/LeaderboardEntry');

// Award points to a user and record timestamp
async function awardPoints(userId, amount, reason) {
  const entry = await LeaderboardEntry.findOneAndUpdate(
    { userId },
    { $inc: { points: amount }, $set: { updatedAt: Date.now() } },
    { upsert: true, new: true }
  );
  // Optionally log reason somewhere (console or a separate collection)
  console.log(`Awarded ${amount} points to ${userId}: ${reason}`);
  return entry;
}

// Retrieve top N entries sorted by points desc
async function getTopEntries(limit = 10) {
  return LeaderboardEntry.find({})
    .sort({ points: -1 })
    .limit(limit)
    .lean();
}

module.exports = { awardPoints, getTopEntries };