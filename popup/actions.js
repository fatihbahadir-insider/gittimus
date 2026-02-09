import { CONFIG } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

export async function exportToJSON() {
  try {
    const data = await chrome.storage.local.get(CONFIG.STORAGE_KEYS.RULES);
    const json = JSON.stringify(data[CONFIG.STORAGE_KEYS.RULES] || {}, null, 2);

  
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gittimus-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    logger.log('Popup Actions', 'Export completed');
    return true;
  } catch (error) {
    logger.error('Popup Actions', 'Export error:', error);
    alert('Failed to export. Check console for details.');
    return false;
  }
}

export async function clearHistory() {
  if (confirm('Are you sure you want to clear all version history?\n\nThis action cannot be undone.')) {
    try {
      await chrome.storage.local.clear();
      logger.log('Popup Actions', 'History cleared');
      return true;
    } catch (error) {
      logger.error('Popup Actions', 'Clear error:', error);
      alert('Failed to clear history. Check console for details.');
      return false;
    }
  }
  return false;
}
