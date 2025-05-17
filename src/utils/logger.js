// src/utils/logger.js

export default {
  info: (message, tag = 'INFO') => {
    console.log(`[${tag}] ${message}`);
  },

  error: (message, tag = 'ERROR') => {
    console.error(`[${tag}] ${message}`);
  },
};
