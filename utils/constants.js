export const CONFIG = {
  ENDPOINTS: {
    CREATE: 'create-custom-rule',
    UPDATE: 'custom/update',
    DELETE: 'custom'
  },

  STORAGE_KEYS: {
    RULES: 'rules',
    CURRENT_TRACKING: 'currentTracking'
  },

  UI: {
    REFRESH_INTERVAL: 2000
  },

  VERSION_TYPES: {
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE'
  }
};

export const MESSAGES = {
  API_INTERCEPTED: 'API_INTERCEPTED',
  GET_HISTORY: 'GET_HISTORY'
};
