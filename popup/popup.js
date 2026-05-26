import { MESSAGES } from '../utils/constants.js';
import { logger } from '../utils/logger.js';
import { displayTrackingStatus, displayRules, displayEmptyState } from './ui.js';
import { listRules } from './api.js';
logger.log('Popup', 'Loaded');

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
    displayRules(rules);
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
    const loginBtn = document.getElementById('auth-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (isLoggedIn && user) {
      section.classList.add('logged-in');
      userEl.textContent = `Welcome, ${user.email || user.name || 'User'}`;
      userEl.style.display = 'block';
      loginBtn.style.display = 'none';
      logoutBtn.style.display = 'block';
    } else {
      section.classList.remove('logged-in');
      userEl.style.display = 'none';
      loginBtn.style.display = 'block';
      logoutBtn.style.display = 'none';
    }
  } catch (e) {
    logger.error('Popup', 'Failed to load auth status:', e);
  }
}

function setupEventListeners() {
  document.getElementById('auth-btn').addEventListener('click', async () => {
    chrome.runtime.sendMessage({ type: MESSAGES.LOGIN });
    await loadAuthStatus();
    await loadRules();
  });

  document.getElementById('logout-btn').addEventListener('click', async () => {
    await chrome.runtime.sendMessage({ type: MESSAGES.LOGOUT });
    await loadAuthStatus();
    await loadRules();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  logger.log('Popup', 'DOM loaded, initializing...');


  setupEventListeners();
  loadAuthStatus();
  loadRules();
});
