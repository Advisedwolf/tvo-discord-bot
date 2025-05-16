// src/utils/translator.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Determine __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_LOCALE = "en";
const LOCALES_DIR = path.resolve(__dirname, "../config/locales");
let cache = {};

/**
 * Load a locale file (with caching).
 */
function loadLocale(locale) {
  if (cache[locale]) return cache[locale];

  try {
    const data = fs.readFileSync(
      path.join(LOCALES_DIR, `${locale}.json`),
      "utf-8",
    );
    cache[locale] = JSON.parse(data);
  } catch (err) {
    console.warn(
      `⚠️  Locale file for "${locale}" not found, falling back to "${DEFAULT_LOCALE}".`,
    );
    if (locale !== DEFAULT_LOCALE) {
      cache[locale] = loadLocale(DEFAULT_LOCALE);
    } else {
      cache[locale] = {};
    }
  }

  return cache[locale];
}

/**
 * Translate a key with optional params and locale.
 * @param {string} key      — e.g. "ping.success"
 * @param {object} [params] — e.g. { user: 'Alice' }
 * @param {string} [locale] — e.g. 'es'
 */
export function t(key, params = {}, locale = DEFAULT_LOCALE) {
  const messages = loadLocale(locale);
  let str = messages[key] ?? key;

  // Simple {param} interpolation
  Object.entries(params).forEach(([k, v]) => {
    str = str.replaceAll(`{${k}}`, v);
  });

  return str;
}
