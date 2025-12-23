/**
 * Simple logger utility
 * Can be extended with winston or other logging libraries
 */

const LOG_LEVEL = process.env.LOG_LEVEL || 'debug';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const colors = {
  error: '\x1b[31m', // Red
  warn: '\x1b[33m',  // Yellow
  info: '\x1b[36m',  // Cyan
  debug: '\x1b[35m', // Magenta
  reset: '\x1b[0m',
};

const shouldLog = (level) => {
  return levels[level] <= levels[LOG_LEVEL];
};

const formatMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message} ${metaStr}`;
};

const logger = {
  error: (message, meta = {}) => {
    if (shouldLog('error')) {
      console.error(`${colors.error}${formatMessage('error', message, meta)}${colors.reset}`);
    }
  },

  warn: (message, meta = {}) => {
    if (shouldLog('warn')) {
      console.warn(`${colors.warn}${formatMessage('warn', message, meta)}${colors.reset}`);
    }
  },

  info: (message, meta = {}) => {
    if (shouldLog('info')) {
      console.info(`${colors.info}${formatMessage('info', message, meta)}${colors.reset}`);
    }
  },

  debug: (message, meta = {}) => {
    if (shouldLog('debug')) {
      console.log(`${colors.debug}${formatMessage('debug', message, meta)}${colors.reset}`);
    }
  },
};

module.exports = logger;
