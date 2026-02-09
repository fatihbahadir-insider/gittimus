import { formatTimestamp } from '../utils/helpers.js';
import { logger } from '../utils/logger.js';

export function displayEmptyState() {
  const listEl = document.getElementById('version-list');
  listEl.innerHTML = '<li class="empty-state">No versions recorded yet.<br>Navigate to Insider custom rules and start tracking!</li>';
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
    document.getElementById('rule-id').textContent = rule.id;
  } else {
    statusEl.classList.remove('active');
    statusText.textContent = 'Not tracking';
    ruleInfo.style.display = 'none';
  }
}

export function displayStorageUsage() {
  chrome.storage.local.getBytesInUse(null, (bytes) => {
    const kb = (bytes / 1024).toFixed(2);
    document.getElementById('storage-usage').textContent = `${kb} KB used`;
  });
}

export function displayVersions(versions, onVersionClick) {
  const listEl = document.getElementById('version-list');

  if (!versions || versions.length === 0) {
    displayEmptyState();
    return;
  }

  listEl.innerHTML = '';

  
const sorted = [...versions].sort((a, b) => b.timestamp - a.timestamp);

  sorted.forEach(version => {
    const li = document.createElement('li');
    li.className = 'version-item';

    const date = formatTimestamp(version.timestamp);
    const typeClass = `type-${version.type.toLowerCase()}`;

    
  let preview = '';
    if (version.content) {
      preview = version.content.substring(0, 80).replace(/\n/g, ' ');
    }

    li.innerHTML = `
      <div class="version-header">
        <span class="version-type ${typeClass}">${version.type}</span>
        <span class="version-date">${date}</span>
      </div>
      ${preview ? `<div class="version-preview">${preview}...</div>` : ''}
    `;

    li.addEventListener('click', () => onVersionClick(version));
    listEl.appendChild(li);
  });

  logger.log('Popup UI', 'Displayed', sorted.length, 'versions');
}

export function showVersionDetail(version) {
  const content = version.content || 'No content';
  const oldContent = version.oldContent ? `\n\n--- OLD VERSION ---\n${version.oldContent}` : '';

  const message = `Version: ${version.id}
Type: ${version.type}
Timestamp: ${new Date(version.timestamp).toLocaleString()}

--- CONTENT ---
${content}${oldContent}`;

  
navigator.clipboard.writeText(content).then(() => {
    logger.log('Popup UI', 'Content copied to clipboard');
  });

  alert(`${message}\n\n✓ Content copied to clipboard!`);
}
