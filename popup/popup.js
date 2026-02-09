import { CONFIG } from '../utils/constants.js';
import { logger } from '../utils/logger.js';
import { displayTrackingStatus, displayStorageUsage, displayVersions, displayEmptyState, showVersionDetail } from './ui.js';
import { exportToJSON, clearHistory } from './actions.js';

logger.log('Popup', 'Loaded');

async function loadHistory() {
  try {
    const data = await chrome.storage.local.get([
      CONFIG.STORAGE_KEYS.RULES,
      CONFIG.STORAGE_KEYS.CURRENT_TRACKING,
      CONFIG.STORAGE_KEYS.TRACKING_STATE
    ]);

    logger.log('Popup', 'Data loaded:', data);

    const currentTracking = data[CONFIG.STORAGE_KEYS.CURRENT_TRACKING];
    const rules = data[CONFIG.STORAGE_KEYS.RULES];

    if (currentTracking && rules?.[currentTracking]) {
      const rule = rules[currentTracking];
      displayTrackingStatus(rule);
      displayVersions(rule.versions || [], showVersionDetail);
    } else {
      displayTrackingStatus(null);

      const allRules = rules ? Object.values(rules) : [];
      const allVersions = allRules.flatMap(rule => rule.versions || []);

      if (allVersions.length > 0) {
        displayVersions(allVersions, showVersionDetail);
      } else {
        displayEmptyState();
      }
    }

    displayStorageUsage();
  } catch (error) {
    logger.error('Popup', 'Error loading history:', error);
    displayEmptyState();
  }
}

function setupEventListeners() {
  document.getElementById('export-btn').addEventListener('click', exportToJSON);

  document.getElementById('clear-btn').addEventListener('click', async () => {
    const cleared = await clearHistory();
    if (cleared) {
      loadHistory();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  logger.log('Popup', 'DOM loaded, initializing...');

  setupEventListeners();
  loadHistory();

  setInterval(loadHistory, CONFIG.UI.REFRESH_INTERVAL);
});
