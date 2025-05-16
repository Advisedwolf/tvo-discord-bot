import "dotenv/config";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { REST, Routes } from "discord.js";

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId || !guildId) {
  console.error(
    "Missing DISCORD_TOKEN, CLIENT_ID, or GUILD_ID in environment variables.",
  );
  process.exit(1);
}

const rest = new REST({ version: "10" }).setToken(token);

/**
 * Recursively collects all .js files under a directory.
 * @param {string} dir - The directory to search.
 * @returns {string[]} - Array of absolute file paths.
 */
function getCommandFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((dirent) => {
    const fullPath = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      return getCommandFiles(fullPath);
    } else if (dirent.isFile() && dirent.name.endsWith(".js")) {
      return [fullPath];
    }
    return [];
  });
}

/**
 * Dynamically imports and returns command data objects from all .js files in a directory.
 * @param {string} dirPath
 * @returns {Promise<Array>} - Array of command JSON data
 */
async function loadCommandsFromDir(dirPath) {
  const commands = [];
  const files = getCommandFiles(dirPath);

  for (const filePath of files) {
    try {
      const commandModule = await import(pathToFileURL(filePath).href);
      const commandData = commandModule.data || commandModule.default?.data;
      if (!commandData) {
        console.warn(`Skipping command at ${filePath}: missing 'data' export.`);
        continue;
      }
      if (typeof commandData.toJSON !== "function") {
        console.warn(
          `Skipping command at ${filePath}: 'data' export missing toJSON method.`,
        );
        continue;
      }
      commands.push(commandData.toJSON());
      console.log(`Loaded command from ${filePath}`);
    } catch (err) {
      console.error(`Failed to load command at ${filePath}:`, err);
    }
  }

  return commands;
}

async function main() {
  try {
    const prodCommandsDir = path.join(process.cwd(), "src", "commands");
    const testCommandsDir = path.join(process.cwd(), "tests", "commands");

    const prodCommands = await loadCommandsFromDir(prodCommandsDir);
    const testCommands =
      process.env.NODE_ENV === "test"
        ? await loadCommandsFromDir(testCommandsDir)
        : [];

    // Combine and dedupe by name
    const allCommands = [];
    const seen = new Set();
    for (const cmd of [...prodCommands, ...testCommands]) {
      if (seen.has(cmd.name)) {
        console.warn(`Duplicate command skipped: ${cmd.name}`);
        continue;
      }
      seen.add(cmd.name);
      allCommands.push(cmd);
    }

    console.log(
      `Registering ${allCommands.length} commands to guild ${guildId}...`,
    );
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: allCommands,
    });
    console.log("Successfully registered application commands.");
  } catch (error) {
    console.error("Error registering commands:", error);
    process.exit(1);
  }
}

main();
