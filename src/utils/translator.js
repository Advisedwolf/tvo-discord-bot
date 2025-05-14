
const fs = require('fs');
const path = require('path');
const { Translator } = require('deepl-node');
const logger = require('./logger');

const translator = new Translator(process.env.DEEPL_API_KEY);
const localesDir = path.resolve(__dirname, '../../config');


// Load and parse a locale file every time (no caching)
function loadLocale(locale) {
  try {
    const filePath = path.join(localesDir, `${locale}.json`);
logger.debug(`Looking for locale file: ${filePath}`, 'i18n');
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (err) {
    logger.error(`Failed to load ${locale}.json: ${err.message}`, 'i18n');
  }
  return {};
}

// Moved outside to be globally accessible
function resolveKey(obj, path) {
  if (!obj || typeof obj !== 'object') return undefined;
  return path.split('.').reduce((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return acc[part];
    }
    return undefined;
  }, obj);
}

// Translation function
function t(key, locale = 'en', params = {}) {
  const messages = loadLocale(locale);
  const fallback = loadLocale('en');
logger.debug(`Key: ${key}`, 'i18n');
logger.debug(`Locale: ${locale}`, 'i18n');

  let template = resolveKey(messages, key) || resolveKey(fallback, key) || key;
logger.debug(`Resolved from locale: ${resolveKey(messages, key)}`, 'i18n');
logger.debug(`Resolved from fallback: ${resolveKey(fallback, key)}`, 'i18n');
  return template.replace(/\{(\w+)\}/g, (_, p) =>
    params[p] !== undefined ? params[p] : `{${p}}`
  );
}

// DeepL optional translation utility
async function translateToLocale(key, locale) {
  const base = loadLocale('en');
  const text = resolveKey(base, key) || key;
  if (locale === 'en') return text;

  try {
    const result = await translator.translateText(text, null, locale);
    const translated = result.text;

    const target = loadLocale(locale);
    let current = target;
    const parts = key.split('.');
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = translated;

    fs.writeFileSync(
      path.join(localesDir, `${locale}.json`),
      JSON.stringify(target, null, 2),
      'utf-8'
    );

    return translated;
  } catch (err) {
    logger.error(`DeepL error (${key}, ${locale}): ${err.message}`, 'i18n');
    return text;
  }
}

module.exports = { t, translateToLocale };
