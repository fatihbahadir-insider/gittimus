import { CONFIG } from '../utils/constants.js';
import { logger } from '../utils/logger.js';


export async function storeVersion(versionData) {
  const { ruleId, ruleName, type, content, newContent, oldContent, contentBase64, timestamp } = versionData;

  const result = await chrome.storage.local.get(CONFIG.STORAGE_KEYS.RULES);
  const rules = result[CONFIG.STORAGE_KEYS.RULES] || {};

  if (!rules[ruleId]) {
    rules[ruleId] = {
      id: ruleId,
      name: ruleName,
      versions: [],
      deleted: false,
      createdAt: timestamp
    };
    logger.log('Storage', 'Created new rule entry:', ruleId);
  }

  const version = {
    id: `v${timestamp}`,
    timestamp,
    type,
    content: type === CONFIG.VERSION_TYPES.CREATE ? content : newContent,
    oldContent: type === CONFIG.VERSION_TYPES.UPDATE ? oldContent : null,
    contentBase64
  };

  rules[ruleId].versions.push(version);

  await chrome.storage.local.set({ [CONFIG.STORAGE_KEYS.RULES]: rules });

  logger.log('Storage', 'Version stored:', {
    ruleId,
    type,
    versionCount: rules[ruleId].versions.length
  });

  logStorageUsage();

  return version;
}

export async function markAsDeleted(ruleId, timestamp) {
  const result = await chrome.storage.local.get(CONFIG.STORAGE_KEYS.RULES);
  const rules = result[CONFIG.STORAGE_KEYS.RULES] || {};

  if (rules[ruleId]) {
    rules[ruleId].deleted = true;
    rules[ruleId].deletedAt = timestamp;
    await chrome.storage.local.set({ [CONFIG.STORAGE_KEYS.RULES]: rules });
    logger.log('Storage', 'Rule marked as deleted:', ruleId);
  }
}

export async function getVersionHistory() {
  const result = await chrome.storage.local.get([
    CONFIG.STORAGE_KEYS.RULES,
    CONFIG.STORAGE_KEYS.CURRENT_TRACKING,
    CONFIG.STORAGE_KEYS.TRACKING_STATE
  ]);
  return result;
}

export async function getRule(ruleId) {
  const result = await chrome.storage.local.get(CONFIG.STORAGE_KEYS.RULES);
  const rules = result[CONFIG.STORAGE_KEYS.RULES] || {};
  return rules[ruleId];
}

export async function updateTrackingState(state) {
  await chrome.storage.local.set({
    [CONFIG.STORAGE_KEYS.TRACKING_STATE]: state
  });
}

export async function setCurrentTracking(ruleId) {
  await chrome.storage.local.set({
    [CONFIG.STORAGE_KEYS.CURRENT_TRACKING]: ruleId
  });
}

function logStorageUsage() {
  chrome.storage.local.getBytesInUse(null, (bytes) => {
    const kb = (bytes / 1024).toFixed(2);
    logger.log('Storage', `Usage: ${kb} KB`);
  });
}
