// src/services/servicesRegistry.js
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const servicesDir = path.join(process.cwd(), "src", "services");
const registryFile = path.basename(fileURLToPath(import.meta.url));

/**
 * Recursively finds all .js files under a directory,
 * skipping the registry itself and any 'embeds' folders.
 */
function getServiceFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((dirent) => {
    const fullPath = path.join(dir, dirent.name);

    // Skip embed-template directories entirely
    if (dirent.isDirectory()) {
      if (dirent.name === "embeds") return [];
      return getServiceFiles(fullPath);
    }

    // Only include .js files (exclude this registry file)
    if (
      dirent.isFile() &&
      dirent.name.endsWith(".js") &&
      dirent.name !== registryFile
    ) {
      return [fullPath];
    }

    return [];
  });
}

// Registry object for service handlers
const services = {};

// Load and register each service file (case-insensitive keys)
for (const filePath of getServiceFiles(servicesDir)) {
  const rawKey = path.basename(filePath, ".js");
  const key = rawKey.toLowerCase();

  try {
    const module = require(filePath);
    const handler = module.default || module;
    if (typeof handler === "function") {
      services[key] = handler;
      console.log(`Registered service: ${key}`);
    }
  } catch (error) {
    console.error(`Failed to load service: ${filePath}`, error);
  }
}

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

// Optional: export the services map for inspection or testing
export { services };
