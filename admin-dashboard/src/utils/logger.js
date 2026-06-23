/**
 * Logger Utility
 * نظام تسجيل مركزي للتطبيق
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const currentLogLevel = import.meta.env.DEV ? LOG_LEVELS.DEBUG : LOG_LEVELS.WARN;

const formatLog = (level, message, data) => {
  const timestamp = new Date().toISOString();
  return {
    timestamp,
    level,
    message,
    data,
  };
};

export const logger = {
  debug: (message, data) => {
    if (currentLogLevel <= LOG_LEVELS.DEBUG) {
      console.log(formatLog("DEBUG", message, data));
    }
  },

  info: (message, data) => {
    if (currentLogLevel <= LOG_LEVELS.INFO) {
      console.info(formatLog("INFO", message, data));
    }
  },

  warn: (message, data) => {
    if (currentLogLevel <= LOG_LEVELS.WARN) {
      console.warn(formatLog("WARN", message, data));
    }
  },

  error: (message, error) => {
    if (currentLogLevel <= LOG_LEVELS.ERROR) {
      console.error(formatLog("ERROR", message, error));
    }
  },
};
