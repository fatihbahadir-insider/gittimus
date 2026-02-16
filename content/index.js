import { MESSAGES } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

const GITTIMUS_MSG_TYPE = '__GITTIMUS_XHR_INTERCEPTED__';

logger.log('Content', 'Script loaded');

window.addEventListener('message', (event) => {
  if (event.source !== window || !event.data || event.data.type !== GITTIMUS_MSG_TYPE) {
    return;
  }

  const { endpoint, method, requestBody, responseBody, timestamp } = event.data.payload;

  logger.log('Content', 'XHR Intercepted:', { endpoint, method, requestBody, responseBody });

  try {
    chrome.runtime.sendMessage({
      type: MESSAGES.API_INTERCEPTED,
      endpoint,
      method,
      requestBody,
      responseBody,
      timestamp
    });
  } catch (e) {
    logger.error('Content', 'Extension context invalidated - please refresh the page');
  }
});

logger.log('Content', 'Interception bridge active');
