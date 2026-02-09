const LOG_PREFIX = '[Gittimus]';

export const logger = {
  log(context, ...args) {
    console.log(`${LOG_PREFIX} ${context}`, ...args);
  },

  error(context, ...args) {
    console.error(`${LOG_PREFIX} ${context}`, ...args);
  },

  warn(context, ...args) {
    console.warn(`${LOG_PREFIX} ${context}`, ...args);
  },

  info(context, ...args) {
    console.info(`${LOG_PREFIX} ${context}`, ...args);
  }
};
