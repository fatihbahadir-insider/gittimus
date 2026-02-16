import { CONFIG } from '../utils/constants.js';
import { extractRuleIdFromUrl } from '../utils/helpers.js';
import { logger } from '../utils/logger.js';
import { storeVersion, markAsDeleted, setCurrentTracking } from './storage.js';

async function handleCreate(data) {
  const { requestBody, responseBody, timestamp } = data;

  const ruleId = responseBody.id;
  const ruleName = requestBody.name;
  const contentBase64 = requestBody.content;

  if (!contentBase64) {
    logger.error('Tracker', 'No content in CREATE request');
    return;
  }

  logger.log('Tracker', 'CREATE detected - Rule ID:', ruleId, 'Name:', ruleName);

  await storeVersion({
    ruleId,
    ruleName,
    type: CONFIG.VERSION_TYPES.CREATE,
    contentBase64,
    timestamp
  });

  await setCurrentTracking(ruleId);

  logger.log('Tracker', 'CREATE stored');

  showDownloadNotification(ruleName);
}

async function handleUpdate(data) {
  const { requestBody, timestamp } = data;

  const ruleId = requestBody.id;
  const contentBase64 = requestBody.contentCode;

  if (!contentBase64) {
    logger.error('Tracker', 'No content in UPDATE request');
    return;
  }

  logger.log('Tracker', 'UPDATE detected - Rule ID:', ruleId);

  const storageData = await chrome.storage.local.get(CONFIG.STORAGE_KEYS.RULES);
  const ruleExists = storageData[CONFIG.STORAGE_KEYS.RULES]?.[ruleId];

  const oldContentBase64 = ruleExists?.versions?.slice(-1)[0]?.contentBase64;

  if (contentBase64 === oldContentBase64) {
    logger.log('Tracker', 'UPDATE ignored - content unchanged');
    return;
  }

  const ruleName = ruleExists?.name || requestBody.name || `Rule ${ruleId}`;

  await storeVersion({
    ruleId,
    ruleName,
    type: ruleExists ? CONFIG.VERSION_TYPES.UPDATE : CONFIG.VERSION_TYPES.CREATE,
    oldContentBase64: ruleExists ? oldContentBase64 : null,
    contentBase64,
    timestamp
  });

  await setCurrentTracking(ruleId);

  logger.log('Tracker', ruleExists ? 'UPDATE stored' : 'UPDATE auto-tracked as new rule');

  showDownloadNotification(ruleName);
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

function showDownloadNotification(ruleName) {
  chrome.action.setBadgeText({ text: '!' });
  chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
  chrome.action.setTitle({ title: `${ruleName} updated!` });

  logger.log('Tracker', 'Badge set for:', ruleName);
}
