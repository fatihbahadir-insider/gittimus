import { CONFIG } from '../utils/constants.js';
import { extractRuleIdFromUrl, toBase64 } from '../utils/helpers.js';
import { logger } from '../utils/logger.js';
import { createRule, upsertRule, deleteRule } from './api.js';

export async function handleRuleLoaded(data) {
  const { responseBody } = data;
  if (!responseBody?.id || !responseBody?.test) return;

  const ruleId = responseBody.id;
  const ruleName = responseBody.name;

  logger.log('Tracker', 'RULE_LOADED - Rule ID:', ruleId);
  await createRule(ruleId, ruleName, toBase64(responseBody.test));
}

async function handleCreate(data) {
  const { requestBody, responseBody } = data;

  const ruleId = responseBody.id;
  const ruleName = requestBody.name;
  const contentBase64 = requestBody.content;

  if (!contentBase64) {
    logger.error('Tracker', 'No content in CREATE request');
    return;
  }

  logger.log('Tracker', 'CREATE detected - Rule ID:', ruleId, 'Name:', ruleName);

  const result = await createRule(ruleId, ruleName, contentBase64);
  if (result) {
    logger.log('Tracker', 'CREATE synced to API');
    showNotification(ruleName);
  }
}

async function handleUpdate(data) {
  const { requestBody } = data;

  const ruleId = requestBody.id;
  const ruleName = requestBody.name;
  const contentBase64 = requestBody.contentCode;

  if (!contentBase64) {
    logger.error('Tracker', 'No content in UPDATE request');
    return;
  }

  logger.log('Tracker', 'UPDATE detected - Rule ID:', ruleId);

  let result = await upsertRule(ruleId, contentBase64, ruleName);

  if (result?.notFound) {
    result = await createRule(ruleId, ruleName || String(ruleId), contentBase64);
  }

  if (result) {
    logger.log('Tracker', 'UPDATE synced to API');
    showNotification(ruleName || `Rule ${ruleId}`);
  }
}

async function handleDelete(data) {
  const { endpoint } = data;

  const ruleId = extractRuleIdFromUrl(endpoint);
  if (!ruleId) {
    logger.error('Tracker', 'Failed to extract rule ID from delete endpoint');
    return;
  }

  logger.log('Tracker', 'DELETE detected - Rule ID:', ruleId);

  await deleteRule(ruleId);
  logger.log('Tracker', 'DELETE synced to API');
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

function showNotification(ruleName) {
  chrome.action.setBadgeText({ text: '!' });
  chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
  chrome.action.setTitle({ title: `${ruleName} synced!` });
  logger.log('Tracker', 'Badge set for:', ruleName);
}
