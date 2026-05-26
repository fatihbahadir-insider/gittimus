import { CONFIG } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

export async function getAccessToken() {
  const result = await chrome.storage.local.get(CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
  return result[CONFIG.STORAGE_KEYS.ACCESS_TOKEN] || null;
}

export async function setAccessToken(token) {
  await chrome.storage.local.set({ [CONFIG.STORAGE_KEYS.ACCESS_TOKEN]: token });
}

export async function clearAuth() {
  await chrome.storage.local.remove([
    CONFIG.STORAGE_KEYS.ACCESS_TOKEN,
    CONFIG.STORAGE_KEYS.AUTH_USER
  ]);
}

export async function refreshAccessToken() {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/auth/refresh`, {
      credentials: 'include'
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (data.accessToken) {
      await setAccessToken(data.accessToken);
      return data.accessToken;
    }
    return null;
  } catch (error) {
    logger.error('Auth', 'Token refresh failed:', error);
    return null;
  }
}

async function fetchAndStoreUser(token) {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      const user = await response.json();
      await chrome.storage.local.set({ [CONFIG.STORAGE_KEYS.AUTH_USER]: user });
    }
  } catch (e) {
    logger.error('Auth', 'Failed to fetch user profile:', e);
  }
}

export function initiateLogin() {
  chrome.tabs.create({ url: `${CONFIG.API_BASE_URL}/auth/google?state=extension` });

  const onTabUpdated = (tabId, changeInfo, tab) => {
    if (changeInfo.status !== 'complete' || !tab.url) return;
    if (!tab.url.startsWith(`${CONFIG.API_BASE_URL}/auth/callback`)) return;

    try {
      const url = new URL(tab.url);
      const token = url.searchParams.get('token');
      if (token) {
        setAccessToken(token).then(() => {
          fetchAndStoreUser(token);
          chrome.tabs.remove(tabId);
          logger.log('Auth', 'Login successful');
        });
      }
    } catch (e) {
      logger.error('Auth', 'Callback parse error:', e);
    }

    chrome.tabs.onUpdated.removeListener(onTabUpdated);
  };

  chrome.tabs.onUpdated.addListener(onTabUpdated);
}

export async function logout() {
  try {
    await fetch(`${CONFIG.API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  } catch (e) {
    logger.error('Auth', 'Logout request failed:', e);
  }
  await clearAuth();
  logger.log('Auth', 'Logged out');
}

export async function getAuthStatus() {
  const result = await chrome.storage.local.get([
    CONFIG.STORAGE_KEYS.ACCESS_TOKEN,
    CONFIG.STORAGE_KEYS.AUTH_USER
  ]);
  return {
    isLoggedIn: !!result[CONFIG.STORAGE_KEYS.ACCESS_TOKEN],
    user: result[CONFIG.STORAGE_KEYS.AUTH_USER] || null
  };
}
