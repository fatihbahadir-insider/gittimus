export const CONFIG = {
  URL_KEYWORDS: ['inone', 'rules'],

  BUTTON_ID: 'custom-rules',
  EMPTY_BUTTON_TITLE: 'Select Custom Rule',

  ENDPOINTS: {
    CREATE: 'create-custom-rule',
    UPDATE: 'custom/update',
    DELETE: 'custom'
  },

  STORAGE_KEYS: {
    RULES: 'rules',
    CURRENT_TRACKING: 'currentTracking',
    TRACKING_STATE: 'trackingState'
  },

  UI: {
    BADGE_EMOJI: '📌',
    BADGE_OFFSET_TOP: -8,
    BADGE_OFFSET_RIGHT: -20,
    REFRESH_INTERVAL: 2000
  },

  VERSION_TYPES: {
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE'
  }
};

export const MESSAGES = {
  START_TRACKING: 'START_TRACKING',
  STOP_TRACKING: 'STOP_TRACKING',
  API_INTERCEPTED: 'API_INTERCEPTED',
  GET_HISTORY: 'GET_HISTORY'
};
