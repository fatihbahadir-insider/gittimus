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

export function toBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach(b => binary += String.fromCharCode(b));
  return btoa(binary);
}

export function isCustomRuleEndpoint(url) {
  return url.includes('create-custom-rule') ||
         url.includes('custom/update') ||
         (url.includes('custom') && url.includes('delete'));
}
