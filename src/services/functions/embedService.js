// src/services/functions/embedService.js
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const embedsDir = path.join(process.cwd(), 'src', 'services', 'functions', 'embeds');
const templates = {};

/**
 * Recursively collect all .js files under a directory.
 */
function getTemplateFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const full = path.join(dir, d.name);
    if (d.isDirectory())  return getTemplateFiles(full);
    if (d.isFile() && d.name.endsWith('.js')) return [full];
    return [];
  });
}

// Immediately load all templates with dynamic import
await Promise.all(
  getTemplateFiles(embedsDir).map(async (filePath) => {
    const name = path.basename(filePath, '.js');
    try {
      const mod = await import(pathToFileURL(filePath).href);
      const tmpl = mod.default ?? mod;
      if (typeof tmpl === 'function') {
        templates[name] = tmpl;
        console.log(`Registered embed template: ${name}`);
      }
    } catch (err) {
      console.error(`Failed loading embed ${name} from ${filePath}`, err);
    }
  })
);

/**
 * Create an embed by template type.
 * @param {string} type
 * @param {object} opts
 */
export function createEmbed(type, opts) {
  const tpl = templates[type];
  if (!tpl) throw new Error(`Embed template "${type}" not found.`);
  return tpl(opts);
}

