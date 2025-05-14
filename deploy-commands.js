// deploy-commands.js
// Registers (or updates) slash commands for your guild

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

// Load environment variables
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

// Commands directory
const commandsPath = path.join(__dirname, 'src', 'commands');

// Collect all command modules
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter(file => file.endsWith('.js'));

const commands = [];
// Auto-load all commands except profile and alerts (we'll add those explicitly)
for (const file of commandFiles) {
  if (['profile.js', 'alerts.js'].includes(file)) continue;
  const command = require(path.join(commandsPath, file));
  if ('data' in command && typeof command.data.toJSON === 'function') {
    commands.push(command.data.toJSON());
  }
}

// Explicitly add profile and alerts commands
const profileCommand = require(path.join(commandsPath, 'profile.js'));
const alertsCommand  = require(path.join(commandsPath, 'alerts.js'));
commands.push(profileCommand.data.toJSON());
commands.push(alertsCommand.data.toJSON());

// Instantiate REST client
const rest = new REST({ version: '9' }).setToken(token);

(async () => {
  try {
    console.log(`Registering ${commands.length} slash commands to guild ${guildId}...`);

    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );

    console.log('Successfully registered application commands.');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
})();
