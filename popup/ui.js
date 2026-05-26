import { formatTimestamp } from '../utils/helpers.js';
import { logger } from '../utils/logger.js';
import { CONFIG } from '../utils/constants.js';

export function displayEmptyState(message) {
  const listEl = document.getElementById('version-list');
  listEl.innerHTML = `<li class="empty-state">${message || 'No rules tracked yet.<br>Start working in Insider to sync rules!'}</li>`;
}

export function displayTrackingStatus(rule) {
  const statusEl = document.getElementById('tracking-status');
  const statusText = document.getElementById('status-text');
  const ruleInfo = document.getElementById('rule-info');

  if (rule) {
    statusEl.classList.add('active');
    statusText.textContent = 'Tracking active';
    ruleInfo.style.display = 'block';
    document.getElementById('rule-name').textContent = rule.name || 'Unknown';
    document.getElementById('rule-id').textContent = rule.ruleId;
  } else {
    statusEl.classList.remove('active');
    statusText.textContent = 'Not tracking';
    ruleInfo.style.display = 'none';
  }
}

export function displayRules(rules) {
  const listEl = document.getElementById('version-list');

  if (!rules || rules.length === 0) {
    displayEmptyState();
    return;
  }

  listEl.innerHTML = '';

  rules.forEach(rule => {
    const li = document.createElement('li');
    li.className = 'version-item';

    const date = formatTimestamp(new Date(rule.updatedAt).getTime());
    const count = rule.versionCount;

    li.innerHTML = `
      <div class="version-header">
        <span class="version-type type-update">${count} version${count !== 1 ? 's' : ''}</span>
        <span class="version-date">${date}</span>
      </div>
      <div class="version-preview">${rule.name || rule.ruleId}</div>
    `;

    li.style.cursor = 'pointer';
    li.addEventListener('click', () => {
      chrome.tabs.create({ url: `${CONFIG.APP_BASE_URL}/rules/${rule.ruleId}` });
    });

    listEl.appendChild(li);
  });

  logger.log('Popup UI', 'Displayed', rules.length, 'rules');
}
