// Gittimus - Network Request Interception
import { isCustomRuleEndpoint } from '../utils/helpers.js';
import { MESSAGES } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

export function setupFetchInterception() {
  const originalFetch = window.fetch;

  window.fetch = async function(...args) {
    const [url, options] = args;

    let requestBody = null;
    if (options?.body) {
      try {
        requestBody = JSON.parse(options.body);
      } catch (e) {
  
      }
    }

    const response = await originalFetch.apply(this, args);

    const clone = response.clone();

    if (typeof url === 'string' && isCustomRuleEndpoint(url)) {
      try {
        const responseBody = await clone.json();

        logger.log('Interceptor', 'API Intercepted:', {
          endpoint: url,
          method: options?.method || 'GET',
          requestBody,
          responseBody
        });

  
        chrome.runtime.sendMessage({
          type: MESSAGES.API_INTERCEPTED,
          endpoint: url,
          method: options?.method || 'GET',
          requestBody,
          responseBody,
          timestamp: Date.now()
        });
      } catch (e) {
        logger.error('Interceptor', 'Failed to parse response:', e);
      }
    }

    return response;
  };

  logger.log('Interceptor', 'Fetch interception setup complete');
}

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
