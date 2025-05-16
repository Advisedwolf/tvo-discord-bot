// src/services/functions/embedService.js
import fs from "fs";
import path from "path";
import { createRequire } from "module";

// Use CommonJS-style require to dynamically load embed templates
const require = createRequire(import.meta.url);

// Path to the embeds directory under functions
const embedsDir = path.join(
  process.cwd(),
  "src",
  "services",
  "functions",
  "embeds",
);

// Template registry
const templates = {};

/**
 * Recursively find all .js files under a directory.
 * @param {string} dir
 * @returns {string[]} Array of absolute file paths.
 */
function getTemplateFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((dirent) => {
    const fullPath = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      return getTemplateFiles(fullPath);
    } else if (dirent.isFile() && dirent.name.endsWith(".js")) {
      return [fullPath];
    }
    return [];
  });
}

// Dynamically load all .js files in the embeds directory (recursively)
for (const filePath of getTemplateFiles(embedsDir)) {
  const name = path.basename(filePath, ".js");
  try {
    const tmplModule = require(filePath);
    const template = tmplModule.default || tmplModule;
    if (typeof template === "function") {
      templates[name] = template;
      console.log(`Registered embed template: ${name}`);
    }
  } catch (err) {
    console.error(`Failed to load embed template at ${filePath}:`, err);
  }
}

/**
 * Create an embed by template type.
 * @param {string} type - Key matching a template filename.
 * @param {object} options - Data to pass into the template function.
 * @returns {import('discord.js').EmbedBuilder}
 */
export function createEmbed(type, options) {
  const template = templates[type];
  if (!template) {
    throw new Error(`Embed template "${type}" not found.`);
  }
  return template(options);
}
