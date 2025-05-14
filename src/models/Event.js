
const mongoose = require('mongoose');

const roundSchema = new mongoose.Schema({
  start: { type: Date, required: true },
  end: { type: Date }
});

const eventSchema = new mongoose.Schema({
  discordEventId: { type: String, required: true },
  key: { type: String, required: true },
  type: { type: String, enum: ['single', 'multi-day', 'round-based'], required: true },
  title: { type: String, required: true },
  description: { type: String },
  start: { type: Date, required: true },
  end: { type: Date },
  rounds: [roundSchema],
  createdBy: { type: String, required: true },
  attendees: {
    interested: [{ type: String }],
    notAttending: [{ type: String }]
  },
  posts: {
    summary: { type: String },
    reminder: { type: String },
    start: { type: String }
  }
});

module.exports = mongoose.model('Event', eventSchema);
