import { CONFIG } from '../utils/constants.js';
import { logger } from '../utils/logger.js';
import { getAccessToken, refreshAccessToken, clearAuth } from './auth.js';

async function apiRequest(method, path, body) {
  const token = await getAccessToken();
  if (!token) {
    logger.log('API', 'No token — skipping', method, path);
    return { ok: false, status: 0 };
  }

  const buildOptions = (t) => {
    const opts = {
      method,
      headers: { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' },
      credentials: 'include'
    };
    if (body) opts.body = JSON.stringify(body);
    return opts;
  };

  let response = await fetch(`${CONFIG.API_BASE_URL}${path}`, buildOptions(token));

  if (response.status === 401 || response.status === 403) {
    const newToken = await refreshAccessToken();
    if (!newToken) {
      await clearAuth();
      return { ok: false, status: response.status };
    }
    response = await fetch(`${CONFIG.API_BASE_URL}${path}`, buildOptions(newToken));
  }

  if (response.status === 204) return { ok: true, status: 204, data: true };

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    logger.error('API', `${method} ${path} →`, response.status, text);
    return { ok: false, status: response.status };
  }

  const data = await response.json();
  return { ok: true, status: response.status, data };
}

export async function createRule(ruleId, name, contentBase64) {
  logger.log('API', 'Creating rule:', ruleId);
  const result = await apiRequest('POST', '/rules', { ruleId, name, contentBase64 });
  return result.ok ? result.data : null;
}

export async function upsertRule(ruleId, contentBase64, name) {
  logger.log('API', 'Upserting rule:', ruleId);
  const body = { contentBase64 };
  if (name) body.name = name;
  const result = await apiRequest('PUT', `/rules/${encodeURIComponent(ruleId)}`, body);
  if (result.status === 404) return { notFound: true };
  return result.ok ? result.data : null;
}


export async function deleteRule(ruleId) {
  logger.log('API', 'Deleting rule:', ruleId);
  const result = await apiRequest('DELETE', `/rules/${encodeURIComponent(ruleId)}`);
  return result.ok;
}
