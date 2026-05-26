import { MESSAGES } from '../utils/constants.js';
import { logger } from '../utils/logger.js';
import { processApiCall, handleRuleLoaded } from './tracker.js';
import { initiateLogin, logout, getAuthStatus } from './auth.js';

logger.log('Background', 'Service worker loaded');

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  logger.log('Background', 'Message received:', message.type);

  switch (message.type) {
    case MESSAGES.API_INTERCEPTED:
      processApiCall(message);
      break;

    case MESSAGES.RULE_LOADED:
      handleRuleLoaded(message);
      break;

    case MESSAGES.LOGIN:
      initiateLogin();
      break;

    case MESSAGES.LOGOUT:
      logout().then(sendResponse);
      return true;

    case MESSAGES.GET_AUTH_STATUS:
      getAuthStatus().then(sendResponse);
      return true;

    default:
      logger.log('Background', 'Unknown message type:', message.type);
  }
});

chrome.runtime.onInstalled.addListener((details) => {
  logger.log('Background', 'Extension installed/updated:', details.reason);
});
