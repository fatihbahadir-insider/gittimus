import { isCustomRuleEndpoint } from '../utils/helpers.js';
import { MESSAGES } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

export function setupXHRInterception() {
  const XHR = XMLHttpRequest.prototype;
  const originalOpen = XHR.open;
  const originalSend = XHR.send;

  XHR.open = function(method, url) {
    this._method = method;
    this._url = url;
    return originalOpen.apply(this, arguments);
  };

  XHR.send = function(body) {
    if (this._url && typeof this._url === 'string' && isCustomRuleEndpoint(this._url)) {
      let requestBody = null;
      if (body) {
        try {
          requestBody = JSON.parse(body);
        } catch (e) {
    
        }
      }

      this.addEventListener('load', function() {
        try {
          const responseBody = JSON.parse(this.responseText);

          logger.log('Interceptor', 'XHR Intercepted:', {
            endpoint: this._url,
            method: this._method,
            requestBody,
            responseBody
          });

          chrome.runtime.sendMessage({
            type: MESSAGES.API_INTERCEPTED,
            endpoint: this._url,
            method: this._method,
            requestBody,
            responseBody,
            timestamp: Date.now()
          });
        } catch (e) {
          logger.error('Interceptor', 'Failed to parse XHR response:', e);
        }
      });
    }

    return originalSend.apply(this, arguments);
  };

  logger.log('Interceptor', 'XHR interception setup complete');
}