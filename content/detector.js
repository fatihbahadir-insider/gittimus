import { CONFIG } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

export function shouldActivate() {
  const url = window.location.href;
  const isActive = CONFIG.URL_KEYWORDS.every(keyword => url.includes(keyword));
  logger.log('Detector', 'URL check:', url, '- Active:', isActive);
  return isActive;
}

export function getCurrentRuleInfo() {
  const btn = document.getElementById(CONFIG.BUTTON_ID);
  if (!btn) return null;

  const ruleName = btn.dataset.title;
  if (ruleName === CONFIG.EMPTY_BUTTON_TITLE) return null;

  return { name: ruleName };
}

export function observeCustomRulesButton(onButtonFound) {
  const observer = new MutationObserver(() => {
    const btn = document.getElementById(CONFIG.BUTTON_ID);
    if (btn && btn.dataset.title && btn.dataset.title !== CONFIG.EMPTY_BUTTON_TITLE) {
      onButtonFound(btn);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-title']
  });

  logger.log('Detector', 'Started observing for custom-rules button');
  return observer;
}

export function observeUrlChanges(onUrlChange) {
  let lastUrl = location.href;

  const urlObserver = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      logger.log('Detector', 'URL changed to:', lastUrl);
      onUrlChange(lastUrl);
    }
  });

  urlObserver.observe(document, {
    subtree: true,
    childList: true
  });

  return urlObserver;
}
