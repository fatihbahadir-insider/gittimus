export function decodeBase64(content) {
  try {
    return atob(content);
  } catch (error) {
    console.error('Failed to decode base64:', error);
    return null;
  }
}

export function encodeBase64(content) {
  try {
    return btoa(content);
  } catch (error) {
    console.error('Failed to encode base64:', error);
    return null;
  }
}

export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

export function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function extractRuleIdFromUrl(url) {
  const match = url.match(/custom\/(\d+)\/delete/);
  return match ? match[1] : null;
}

export function isCustomRuleEndpoint(url) {
  return url.includes('create-custom-rule') ||
         url.includes('custom/update') ||
         (url.includes('custom') && url.includes('delete'));
}
