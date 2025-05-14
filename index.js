// index.js
// Bot entrypoint: loads commands, services, events, and schedulers

require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');
const logger = require('./src/utils/logger');
require('./src/database');

const CommandHandler = require('./handlers/commandHandler');
const ServiceHandler = require('./handlers/serviceHandler');

// Create Discord client with necessary intents and partials
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.Reaction
  ]
});

// Load commands and services
CommandHandler.loadCommands(client);
ServiceHandler.loadServices(client);

// Dynamically register event handlers from src/events
const eventsPath = path.join(__dirname, 'src', 'events');
fs.readdirSync(eventsPath)
  .filter(file => file.endsWith('.js'))
  .forEach(file => {
    const event = require(path.join(eventsPath, file));
    if (event.once) {
      client.once(event.name, (...args) => event.execute(client, ...args));
    } else {
      client.on(event.name, (...args) => event.execute(client, ...args));
    }
  });

// Global error handling
process.on('unhandledRejection', err => {
  logger.error(`Unhandled Rejection: ${err.message}`, 'startup');
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN)
  .then(() => logger.info(`✅ Bot logged in as ${client.user.tag}`, 'startup'))
  .catch(err => logger.error(`❌ Login failed: ${err.message}`, 'startup'));
