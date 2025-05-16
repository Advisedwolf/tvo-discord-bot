// src/models/UserProfile.js
import { Schema, model } from "mongoose";

/**
 * UserProfile schema:
 *  - discordId: unique Discord user ID
 *  - locale: user's preferred locale code
 *  - joinedAt: date they first interacted with bot
 *  - data: arbitrary JSON for future use
 */
const userProfileSchema = new Schema({
  discordId: { type: String, required: true, unique: true },
  locale: { type: String, default: "en" },
  joinedAt: { type: Date, default: Date.now },
  data: { type: Schema.Types.Mixed, default: {} },
});

export const UserProfile = model("UserProfile", userProfileSchema);
