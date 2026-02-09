
import { CONFIG } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

const BADGE_ID = 'gittimus-track-btn';

export function injectTrackButton(targetButton, onClick) {
  removeBadge();

  const badge = document.createElement('div');
  badge.id = BADGE_ID;
  badge.className = 'gittimus-badge';
  badge.textContent = CONFIG.UI.BADGE_EMOJI;
  badge.title = 'Track this rule';

  const updatePosition = () => {
    const rect = targetButton.getBoundingClientRect();
    badge.style.position = 'fixed';
    badge.style.top = `${rect.top + CONFIG.UI.BADGE_OFFSET_TOP}px`;
    badge.style.left = `${rect.right + CONFIG.UI.BADGE_OFFSET_RIGHT}px`;
    badge.style.zIndex = '10000';
  };

  updatePosition();

  window.addEventListener('scroll', updatePosition);
  window.addEventListener('resize', updatePosition);

  badge.addEventListener('click', (e) => {
    e.stopPropagation();
    onClick();
  });

  document.body.appendChild(badge);
  logger.log('UI', 'Track button injected');

  return badge;
}

export function setTrackingState(isTracking) {
  const badge = document.getElementById(BADGE_ID);
  if (!badge) return;

  if (isTracking) {
    badge.classList.add('tracking');
    badge.title = 'Tracking active';
  } else {
    badge.classList.remove('tracking');
    badge.title = 'Track this rule';
  }
}

export function removeBadge() {
  const existingBadge = document.getElementById(BADGE_ID);
  if (existingBadge) {
    existingBadge.remove();
    logger.log('UI', 'Badge removed');
  }
}
