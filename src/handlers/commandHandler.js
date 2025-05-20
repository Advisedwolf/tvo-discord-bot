// src/handlers/commandHandler.js
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import logger from '../utils/logger.js';

/**
 * Recursively loads all slash commands from src/commands
 * into client.commands (a Map<name, module>).
 */
export async function loadCommands(client) {
  const commandsDir = path.join(process.cwd(), 'src', 'commands');

  async function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        try {
          const { default: cmd } = await import(pathToFileURL(fullPath).href);
          if (!cmd?.data || !cmd?.execute) {
            logger.warn(`[commandHandler] Skipping ${fullPath}: missing \`data\` or \`execute\``);
            continue;
          }
          client.commands.set(cmd.data.name, cmd);
          logger.info(`[commandHandler] Loaded command: ${cmd.data.name}`);
        } catch (err) {
          logger.error(`[commandHandler] Failed to load ${fullPath}`, err);
        }
      }
    }
  }

  // ensure the Map exists
  client.commands = client.commands || new Map();
  await walk(commandsDir);
}

