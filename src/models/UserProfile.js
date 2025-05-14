const mongoose = require('mongoose');

const UserProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },

  // Onboarding info
  country:              { type: String, default: '' },
  timezone:             { type: String, default: '' },
  locale:               { type: String, default: '' },
  consented:            { type: Boolean, default: false },
  ageRange:             { type: String, default: '' },
  bio:                  { type: String, default: '' },
  gamingExperience:     { type: Number, default: 0 },    // Years of play
  farms:                { type: String, default: '' },   // “0”, “1”, “2-4”, etc.  // Alert subscriptions


  alertSubscriptions: {
    scout:   { type: Boolean, default: false },
    attack:  { type: Boolean, default: false },
    event:   { type: Boolean, default: false }
  },
  alertSubscriptionsGlobal: { type: Boolean, default: false },

  // Event scheduling preferences
  allianceRuinsTime:    { type: String, default: '' },
  attendance: {
    elite:     { type: String, default: '' },
    territory: { type: String, default: '' }
  },

  // Final onboarding flag
  completed:            { type: Boolean, default: false },
  createdAt:            { type: Date,   default: Date.now }
});

module.exports = mongoose.model('UserProfile', UserProfileSchema);

