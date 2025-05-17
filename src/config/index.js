// src/config/index.js
// Load environment variables and export configuration values
import dotenv from 'dotenv';

dotenv.config();

/**
 * Discord Bot token (set in your .env):
 * DISCORD_TOKEN=your_discord_bot_token
 */
export const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

/**
 * MongoDB connection string URI (set in your .env):
 * MONGODB_URI=your_mongodb_connection_string
 */
export const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Imgur Client ID for anonymous uploads (set in your .env):
 * IMGUR_CLIENT_ID=your_imgur_client_id
 */
export const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID;

/**
 * Environment flag (e.g. 'test' or 'live')
 */
export const ENVIRONMENT = process.env.NODE_ENV || 'live';

/**
 * Guild ID for registering commands in 'test' mode (if needed)
 */
export const GUILD_ID = process.env.GUILD_ID || null;
