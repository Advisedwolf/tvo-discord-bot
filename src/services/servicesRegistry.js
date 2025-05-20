// src/services/servicesRegistry.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const servicesRoot = path.join(__dirname);

const services = {};

/**
 * Recursively gather every .js under src/services, except this file and `embeds` folders
 */
function gatherServiceFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((ent) => {
    const fullPath = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === 'embeds') return [];
      return gatherServiceFiles(fullPath);
    }
    if (ent.isFile() && ent.name.endsWith('.js') && fullPath !== __filename) {
      return [fullPath];
    }
    return [];
  });
}

/**
 * Must be called (and awaited) at startup to populate the registry
 */
export async function loadServices() {
  const files = gatherServiceFiles(servicesRoot);
  logger.info(
    `[servicesRegistry] Found service files:\n${files.map(f => `  • ${f}`).join('\n')}`
  );

  for (const fp of files) {
    const relKey = path
      .relative(servicesRoot, fp)     // e.g. "Admin/permissionService.js"
      .replace(/\.js$/, '')          //     "Admin/permissionService"
      .replace(/\\/g, '/')          //     normalize on Windows
      .toLowerCase();                 //     "admin/permissionservice"

    try {
      const mod = await import(pathToFileURL(fp).href);
      services[relKey] = mod.default ?? mod;
      logger.info(`[servicesRegistry] ✅ Registered service key: "${relKey}"`);
    } catch (err) {
      logger.error(`[servicesRegistry] ❌ Failed to load ${fp}`, err);
    }
  }

  logger.info(
    `[servicesRegistry] All registered service keys:\n${Object.keys(services)
      .map(k => `  • ${k}`)
      .join('\n')}`
  );
}

/**
 * Retrieve a service by its lower-cased relative path key
 */
export function getService(key) {
  const svc = services[key.toLowerCase()];
  if (!svc) {
    throw new Error(`Service not found in registry: "${key}"`);
  }
  return svc;
}

// Optional: export `services` for introspection
export { services };

