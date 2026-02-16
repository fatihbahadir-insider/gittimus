(function() {
  const GITTIMUS_MSG_TYPE = '__GITTIMUS_XHR_INTERCEPTED__';

  function isCustomRuleEndpoint(url) {
    return url.includes('create-custom-rule') ||
           url.includes('custom/update') ||
           (url.includes('custom') && url.includes('delete'));
  }

  function sendInterceptedData(endpoint, method, requestBody, responseBody) {
    window.postMessage({
      type: GITTIMUS_MSG_TYPE,
      payload: {
        endpoint,
        method,
        requestBody,
        responseBody,
        timestamp: Date.now()
      }
    }, '*');
  }

  const XHR = XMLHttpRequest.prototype;
  const originalOpen = XHR.open;
  const originalSend = XHR.send;

  XHR.open = function(method, url) {
    this._gittimusMethod = method;
    this._gittimusUrl = url;
    return originalOpen.apply(this, arguments);
  };

  XHR.send = function(body) {
    if (this._gittimusUrl && typeof this._gittimusUrl === 'string' && isCustomRuleEndpoint(this._gittimusUrl)) {
      let requestBody = null;
      if (body) {
        try {
          requestBody = JSON.parse(body);
        } catch (e) {
        }
      }

      const xhr = this;
      this.addEventListener('load', function() {
        try {
          const responseBody = JSON.parse(xhr.responseText);
          sendInterceptedData(xhr._gittimusUrl, xhr._gittimusMethod, requestBody, responseBody);
        } catch (e) {
        }
      });
    }

    return originalSend.apply(this, arguments);
  };

})();
