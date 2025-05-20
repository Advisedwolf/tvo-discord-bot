// src/handlers/eventsRegistry.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import logger from '../utils/logger.js';
import { replyError } from '../utils/replyHelpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const eventsRoot = path.join(__dirname, 'events');

/**
 * Recursively load all event handlers from src/handlers/events/**
 */
export async function loadEventHandlers(client) {
  if (!fs.existsSync(eventsRoot)) return;

  async function walk(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        await walk(fullPath);
      } else if (ent.isFile() && ent.name.endsWith('.js')) {
        try {
          const mod = await import(pathToFileURL(fullPath).href);
          const { name, once, execute } = mod.default ?? mod;
          if (!name || typeof execute !== 'function') {
            logger.warn(`[eventsRegistry] ⚠️ Skipping ${fullPath}: missing name or execute function`);
            continue;
          }
          const handler = async (...args) => {
            try {
              await execute(...args, client);
            } catch (err) {
              // Log internal error
              logger.error(`[${name} event] ❌ Error:`, err);
              // If this event provides an Interaction, send a reply
              const interaction = args.find(a => a && typeof a.reply === 'function');
              if (interaction) await replyError(interaction, 'ERRORS.generic');
            }
          };
          if (once) {
            client.once(name, handler);
          } else {
            client.on(name, handler);
          }
          logger.info(`[eventsRegistry] ✅ Registered event: ${name}`);
        } catch (err) {
          logger.error(`[eventsRegistry] ❌ Failed to load ${fullPath}`, err);
        }
      }
    }
  }

  await walk(eventsRoot);
  logger.info(
    `[eventsRegistry] Total events loaded: ${client.eventNames().length}`
  );
}
