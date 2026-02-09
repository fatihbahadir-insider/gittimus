
import { shouldActivate, getCurrentRuleInfo, observeCustomRulesButton, observeUrlChanges } from './detector.js';
import { injectTrackButton, setTrackingState, removeBadge } from './ui.js';
import { setupFetchInterception, setupXHRInterception } from './interceptor.js';
import { MESSAGES, CONFIG } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

logger.log('Content', 'Script loaded');

function handleTrackClick() {
  const ruleInfo = getCurrentRuleInfo();
  if (!ruleInfo) {
    logger.log('Content', 'No rule selected');
    return;
  }

  chrome.runtime.sendMessage({
    type: MESSAGES.START_TRACKING,
    ruleName: ruleInfo.name,
    timestamp: Date.now()
  });

  setTrackingState(true);
  logger.log('Content', 'Started tracking:', ruleInfo.name);
}

async function initialize() {
  logger.log('Content', 'Initializing...');

  const data = await chrome.storage.local.get([
    CONFIG.STORAGE_KEYS.CURRENT_TRACKING,
    CONFIG.STORAGE_KEYS.TRACKING_STATE
  ]);

  if (data[CONFIG.STORAGE_KEYS.CURRENT_TRACKING]) {
    logger.log('Content', 'Resuming tracking for rule:', data[CONFIG.STORAGE_KEYS.CURRENT_TRACKING]);
  }


  observeCustomRulesButton((btn) => {
    if (!document.getElementById('gittimus-track-btn')) {
      injectTrackButton(btn, handleTrackClick);
    }
  });


  setupFetchInterception();
  setupXHRInterception();
}

function cleanup() {
  removeBadge();
  logger.log('Content', 'Cleaned up');
}

if (shouldActivate()) {
  initialize();


  observeUrlChanges((newUrl) => {
    if (shouldActivate()) {
      initialize();
    } else {
      cleanup();
    }
  });
} else {
  logger.log('Content', 'Not activating - URL does not match');
}
