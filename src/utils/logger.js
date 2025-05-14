
const debugMode = process.env.DEBUG === 'true';

module.exports = {
  info: (msg, scope = 'general') => console.log(`[INFO][${scope}] ${msg}`),
  warn: (msg, scope = 'general') => console.warn(`[WARN][${scope}] ${msg}`),
  error: (msg, scope = 'general') => console.error(`[ERROR][${scope}] ${msg}`),
  debug: (msg, scope = 'general') => {
    if (debugMode) console.log(`[DEBUG][${scope}] ${msg}`);
  }
};
