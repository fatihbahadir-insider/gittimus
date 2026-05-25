import { MESSAGES } from '../utils/constants.js';
import { logger } from '../utils/logger.js';
import { displayTrackingStatus, displayRules, displayEmptyState } from './ui.js';
import { listRules, getRuleHistory } from './api.js';
import { decodeBase64, downloadRuleAsJS } from '../utils/helpers.js';

logger.log('Popup', 'Loaded');

async function handleDownload(rule) {
  try {
    const history = await getRuleHistory(rule.ruleId);
    if (!history || !history.history.length) {
      alert('No versions found for this rule.');
      return;
    }
    const latest = history.history[history.history.length - 1];
    const content = decodeBase64(latest.contentBase64) || '';
    downloadRuleAsJS(rule.name || rule.ruleId, content);
  } catch (e) {
    logger.error('Popup', 'Download failed:', e);
  }
}

async function loadRules() {
  try {
    const { isLoggedIn } = await chrome.runtime.sendMessage({ type: MESSAGES.GET_AUTH_STATUS });

    if (!isLoggedIn) {
      displayTrackingStatus(null);
      displayEmptyState('Login with Google to start syncing your rules.');
      return;
    }

    const rules = await listRules();

    if (!rules || rules.length === 0) {
      displayTrackingStatus(null);
      displayEmptyState();
      return;
    }

    displayTrackingStatus(rules[0]);
    displayRules(rules, handleDownload);
  } catch (error) {
    logger.error('Popup', 'Error loading rules:', error);
    displayEmptyState('Failed to load rules. Check your connection.');
  }
}

async function loadAuthStatus() {
  try {
    const { isLoggedIn, user } = await chrome.runtime.sendMessage({ type: MESSAGES.GET_AUTH_STATUS });
    const section = document.getElementById('auth-section');
    const userEl = document.getElementById('auth-user');
    const btn = document.getElementById('auth-btn');

    if (isLoggedIn && user) {
      section.classList.add('logged-in');
      userEl.textContent = user.email || user.name || 'Signed in';
      btn.textContent = 'Logout';
      btn.className = 'btn-auth btn-logout';
    } else {
      section.classList.remove('logged-in');
      userEl.textContent = 'Not signed in';
      btn.textContent = 'Login with Google';
      btn.className = 'btn-auth btn-login';
    }
  } catch (e) {
    logger.error('Popup', 'Failed to load auth status:', e);
  }
}

function setupEventListeners() {
  document.getElementById('auth-btn').addEventListener('click', async () => {
    const { isLoggedIn } = await chrome.runtime.sendMessage({ type: MESSAGES.GET_AUTH_STATUS });

    if (isLoggedIn) {
      await chrome.runtime.sendMessage({ type: MESSAGES.LOGOUT });
    } else {
      chrome.runtime.sendMessage({ type: MESSAGES.LOGIN });
    }

    await loadAuthStatus();
    await loadRules();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  logger.log('Popup', 'DOM loaded, initializing...');

  chrome.action.setBadgeText({ text: '' });

  setupEventListeners();
  loadAuthStatus();
  loadRules();
});
