// src/utils/translator.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const DEFAULT_LOCALE = 'en';
const LOCALES_DIR   = path.resolve(__dirname, '../config/locales');
const cache = {};

/**
 * Return all available locale codes (without .json extension).
 * e.g. ['en', 'fr', 'es']
 */
export function getSupportedLocales() {
  try {
    return fs
      .readdirSync(LOCALES_DIR)
      .filter(fn => fn.endsWith('.json'))
      .map(fn => path.basename(fn, '.json'));
  } catch {
    return [DEFAULT_LOCALE];
  }
}

/**
 * Load a locale JSON file with caching.
 * Normalizes region tags (e.g., 'fr-FR' -> 'fr').
 * Falls back to DEFAULT_LOCALE if missing.
 */
function loadLocale(locale) {
  // Normalize primary tag
  const primary = locale.split(/[-_]/)[0];
  if (cache[primary]) {
    return cache[primary];
  }

  try {
    const filePath = path.join(LOCALES_DIR, `${primary}.json`);
    const data = fs.readFileSync(filePath, 'utf-8');
    cache[primary] = JSON.parse(data);
  } catch (err) {
    console.warn(
      `⚠️ Locale file for "${primary}" not found, falling back to "${DEFAULT_LOCALE}".`
    );
    if (primary !== DEFAULT_LOCALE) {
      return loadLocale(DEFAULT_LOCALE);
    }
    cache[primary] = {};
  }

  return cache[primary];
}

/**
 * Translate a dot-notation key from the locale data, with optional interpolation.
 *
 * @param {string} key       e.g. "COMMANDS.remind.pickYear"
 * @param {object} [vars={}] values for {{placeholders}} (may include { default } for fallback)
 * @param {string} [locale]  locale code, defaults to DEFAULT_LOCALE
 * @returns {string}
 */
export function t(key, vars = {}, locale = DEFAULT_LOCALE) {
  const localeData = loadLocale(locale);
  const parts = key.split('.');

  let str = parts.reduce((obj, part) => {
    return obj && obj[part] != null ? obj[part] : null;
  }, localeData);

  if (str == null) {
    if (typeof vars.default === 'string') {
      str = vars.default;
    } else {
      return key;
    }
  }

  return str.replace(/\{\{(\w+)\}\}/g, (_, name) => {
    return vars[name] != null ? vars[name] : `{{${name}}}`;
  });
}

export default { t, getSupportedLocales };
