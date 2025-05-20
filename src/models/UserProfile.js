// src/models/UserProfile.js
import { Schema, model } from 'mongoose';

/**
 * UserProfile schema:
 *  - discordId   : unique Discord user ID
 *  - playerName  : in-game name (required)
 *  - locale      : user’s preferred locale code (e.g. "en", "es")
 *  - country     : user’s country (ISO code or name)
 *  - timezone    : IANA timezone identifier (e.g. "Europe/London")
 *  - age         : user’s age in years
 *  - bio         : short biography
 *  - experience  : free-text description of game experience
 *  - joinedAt    : date they first interacted with the bot
 *  - data        : arbitrary JSON for future use
 */
const userProfileSchema = new Schema({
  discordId:   { type: String, required: true, unique: true },
  playerName:  { type: String, required: true },
  locale:      { type: String, default: 'en' },
  country:     { type: String, default: '' },
  timezone:    { type: String, default: 'UTC' },
  age:         { type: Number, min: 0 },
  bio:         { type: String, maxlength: 500, default: '' },
  experience:  { type: String, maxlength: 1000, default: '' },
  joinedAt:    { type: Date, default: Date.now },
  data:        { type: Schema.Types.Mixed, default: {} },
});

export default model('UserProfile', userProfileSchema);
