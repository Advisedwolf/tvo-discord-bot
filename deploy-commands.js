// deploy-commands.js
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';

// 1) Ensure required env vars
const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;
if (!DISCORD_TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.error(
    '❌ Missing one of DISCORD_TOKEN, CLIENT_ID or GUILD_ID in your environment'
  );
  process.exit(1);
}

// 2) Recursively collect all .js files under src/commands
async function getCommandFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getCommandFiles(fullPath)));
    } else if (entry.isFile() && fullPath.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  return files;
}

;(async () => {
  const commands = [];
  const commandsDir = path.join(process.cwd(), 'src', 'commands');
  const filePaths   = await getCommandFiles(commandsDir);

  for (const filePath of filePaths) {
    try {
      const { default: cmd } = await import(pathToFileURL(filePath).href);
      if (!cmd?.data || typeof cmd.data.toJSON !== 'function') {
        console.warn(`⚠️ Skipping ${filePath}: no valid .data export`);
        continue;
      }
      commands.push(cmd.data.toJSON());
      console.log(`✅ Loaded command: ${cmd.data.name}`);
    } catch (err) {
      console.error(`❌ Failed to load ${filePath}:`, err);
    }
  }

  // 3) Push to Discord (guild scope for instant availability)
  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
  try {
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log(`🚀 Successfully registered ${commands.length} commands.`);
  } catch (err) {
    console.error('❌ deploy-commands failed:', err);
    process.exit(1);
  }
})();

