// src/utils/logger.js
/**
 * Friendly multi-level logger with emojis and concise context.
 */
function formatMessage(level, message, context) {
  const timestamp = new Date().toISOString();
  const levelMap = {
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌'
  };
  const emoji = levelMap[level] || '';
  const ctx = context ? ` [${context}]` : '';
  return `${timestamp} ${emoji}${ctx} ${message}`;
}

export default {
  info(message, context) {
    console.log(formatMessage('info', message, context));
  },
  warn(message, context) {
    console.warn(formatMessage('warn', message, context));
  },
  error(message, context) {
    console.error(formatMessage('error', message, context));
  }
};
