import { CONFIG } from '../utils/constants.js';
import { decodeBase64, extractRuleIdFromUrl } from '../utils/helpers.js';
import { logger } from '../utils/logger.js';
import { storeVersion, markAsDeleted, setCurrentTracking, updateTrackingState, getRule } from './storage.js';

let trackingState = {
  isTracking: false,
  currentRuleId: null,
  currentRuleName: null,
  lastVersionContent: null
};

export async function startTracking(ruleName) {
  trackingState.isTracking = true;
  trackingState.currentRuleName = ruleName;

  logger.log('Tracker', 'Tracking started:', ruleName);

  await updateTrackingState(trackingState);
}

export async function stopTracking() {
  trackingState.isTracking = false;
  trackingState.currentRuleId = null;
  trackingState.currentRuleName = null;
  trackingState.lastVersionContent = null;

  logger.log('Tracker', 'Tracking stopped');

  await updateTrackingState(trackingState);
}

async function handleCreate(data) {
  const { requestBody, responseBody, timestamp } = data;

  const ruleId = responseBody.id;
  const ruleName = requestBody.name;
  const contentBase64 = requestBody.content;
  const content = decodeBase64(contentBase64);

  if (!content) {
    logger.error('Tracker', 'Failed to decode CREATE content');
    return;
  }

  logger.log('Tracker', 'CREATE detected - Rule ID:', ruleId, 'Name:', ruleName);

  await storeVersion({
    ruleId,
    ruleName,
    type: CONFIG.VERSION_TYPES.CREATE,
    content,
    contentBase64,
    timestamp
  });

  trackingState.isTracking = true;
  trackingState.currentRuleId = ruleId;
  trackingState.currentRuleName = ruleName;
  trackingState.lastVersionContent = content;

  await setCurrentTracking(ruleId);
  await updateTrackingState(trackingState);

  logger.log('Tracker', 'Auto-tracking started for new rule');
}

async function handleUpdate(data) {
  const { requestBody, timestamp } = data;

  const ruleId = requestBody.id;
  const contentBase64 = requestBody.contentCode;
  const newContent = decodeBase64(contentBase64);

  if (!newContent) {
    logger.error('Tracker', 'Failed to decode UPDATE content');
    return;
  }

  logger.log('Tracker', 'UPDATE detected - Rule ID:', ruleId);

  const storageData = await chrome.storage.local.get([
    CONFIG.STORAGE_KEYS.CURRENT_TRACKING,
    CONFIG.STORAGE_KEYS.RULES
  ]);

  const isTrackingThisRule = storageData[CONFIG.STORAGE_KEYS.CURRENT_TRACKING] == ruleId;
  const ruleExists = storageData[CONFIG.STORAGE_KEYS.RULES]?.[ruleId];

  if (isTrackingThisRule || ruleExists) {
    const oldContent = trackingState.lastVersionContent ||
                      (ruleExists?.versions?.slice(-1)[0]?.content);

    if (newContent !== oldContent) {
      const ruleName = trackingState.currentRuleName || ruleExists?.name || `Rule ${ruleId}`;

      await storeVersion({
        ruleId,
        ruleName,
        type: CONFIG.VERSION_TYPES.UPDATE,
        oldContent,
        newContent,
        contentBase64,
        timestamp
      });

      trackingState.lastVersionContent = newContent;
      trackingState.currentRuleId = ruleId;
      trackingState.currentRuleName = ruleName;

      await setCurrentTracking(ruleId);
      await updateTrackingState(trackingState);

      logger.log('Tracker', 'UPDATE stored');
    } else {
      logger.log('Tracker', 'UPDATE ignored - content unchanged');
    }
  } else {
    logger.log('Tracker', 'UPDATE ignored - not tracking this rule');
  }
}

async function handleDelete(data) {
  const { endpoint, timestamp } = data;

  const ruleId = extractRuleIdFromUrl(endpoint);
  if (!ruleId) {
    logger.error('Tracker', 'Failed to extract rule ID from delete endpoint');
    return;
  }

  logger.log('Tracker', 'DELETE detected - Rule ID:', ruleId);

  await markAsDeleted(ruleId, timestamp);

  if (trackingState.currentRuleId == ruleId) {
    await stopTracking();
  }
}

export async function processApiCall(data) {
  const { endpoint } = data;

  try {
    if (endpoint.includes(CONFIG.ENDPOINTS.CREATE)) {
      await handleCreate(data);
    } else if (endpoint.includes(CONFIG.ENDPOINTS.UPDATE)) {
      await handleUpdate(data);
    } else if (endpoint.includes(CONFIG.ENDPOINTS.DELETE)) {
      await handleDelete(data);
    }
  } catch (error) {
    logger.error('Tracker', 'Error processing API call:', error);
  }
}

export function getTrackingState() {
  return { ...trackingState };
}
