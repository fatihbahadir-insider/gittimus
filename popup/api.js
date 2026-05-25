import { CONFIG } from '../utils/constants.js';

async function getToken() {
  const result = await chrome.storage.local.get(CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
  return result[CONFIG.STORAGE_KEYS.ACCESS_TOKEN] || null;
}

async function apiFetch(path) {
  const token = await getToken();
  if (!token) return null;

  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}${path}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include'
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export async function listRules() {
  return apiFetch('/rules');
}

export async function getRuleHistory(ruleId) {
  return apiFetch(`/rules/${encodeURIComponent(ruleId)}/history`);
}
