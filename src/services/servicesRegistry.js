// src/services/servicesRegistry.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const servicesDir = path.join(process.cwd(), 'src', 'services');
const registryFile = path.basename(__filename);

const services = {};

/**
 * Recursively finds all .js files under a directory,
 * skipping the registry itself and any 'embeds' folders.
 */
function getServiceFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((dirent) => {
    const fullPath = path.join(dir, dirent.name);

    if (dirent.isDirectory()) {
      if (dirent.name === 'embeds') return [];
      return getServiceFiles(fullPath);
    }

    if (dirent.isFile() && dirent.name.endsWith('.js') && dirent.name !== registryFile) {
      return [fullPath];
    }

    return [];
  });
}

/**
 * Load and register all service modules asynchronously.
 */
(async () => {
  for (const filePath of getServiceFiles(servicesDir)) {
    const rawKey = path.basename(filePath, '.js');
    const key = rawKey.toLowerCase();

    try {
      // Turn the file path into a file:// URL, then dynamic-import it
      const url = pathToFileURL(filePath).href;
      const module = await import(url);
      const handler = module.default ?? module;
      if (typeof handler === 'function') {
        services[key] = handler;
        console.log(`Registered service: ${key}`);
      }
    } catch (error) {
      console.error(`Failed to load service: ${filePath}`, error);
    }
  }
})();

/**
 * Retrieve a service by key (case-insensitive).
 * @param {string} key
 */
export function getService(key) {
  const svc = services[key.toLowerCase()];
  if (!svc) {
    throw new Error(`Service "${key}" not found in registry.`);
  }
  return svc;
}

// Optional: export the full registry for inspection or testing
export { services };
