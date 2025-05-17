import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const commands = new Map();

/**
 * Recursively find all JavaScript files under a directory.
 * @param {string} dir - The directory to search.
 * @returns {string[]} Array of absolute file paths.
 */
function getCommandFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((dirent) => {
    const fullPath = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      return getCommandFiles(fullPath);
    } else if (dirent.isFile() && dirent.name.endsWith('.js')) {
      return [fullPath];
    }
    return [];
  });
}

/**
 * Loads all command modules from production and test directories,
 * supporting nested folder structures.
 * @param {import('discord.js').Client} client
 */
export async function loadCommands(client) {
  const prodDir = path.join(process.cwd(), 'src', 'commands');
  const testDir = path.join(process.cwd(), 'tests', 'commands');

  const prodFiles = getCommandFiles(prodDir);
  const testFiles = getCommandFiles(testDir);

  for (const filePath of [...prodFiles, ...testFiles]) {
    try {
      const module = await import(pathToFileURL(filePath).href);
      const command = module.default || module;
      if (command?.data?.name && typeof command.execute === 'function') {
        commands.set(command.data.name, command);
        console.log(`Loaded command: ${command.data.name}`);
      } else {
        console.warn(`Skipping ${filePath}: missing data.name or execute()`);
      }
    } catch (error) {
      console.error(`Failed to load command at ${filePath}:`, error);
    }
  }

  client.commands = commands;
  console.log(`[DEBUG] Commands loaded: ${[...commands.keys()].join(', ')}`);
}
