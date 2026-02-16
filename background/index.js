import { MESSAGES } from '../utils/constants.js';
import { logger } from '../utils/logger.js';
import { processApiCall } from './tracker.js';
import { getVersionHistory } from './storage.js';

logger.log('Background', 'Service worker loaded');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  logger.log('Background', 'Message received:', message.type);

  switch(message.type) {
    case MESSAGES.API_INTERCEPTED:
      processApiCall(message);
      break;

    case MESSAGES.GET_HISTORY:
      getVersionHistory().then(sendResponse);
      return true;

    default:
      logger.log('Background', 'Unknown message type:', message.type);
  }
});

chrome.runtime.onInstalled.addListener((details) => {
  logger.log('Background', 'Extension installed/updated:', details.reason);
});
