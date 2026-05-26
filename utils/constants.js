export const CONFIG = {
  API_BASE_URL: 'http://localhost:3500',
  APP_BASE_URL: 'http://localhost:3000',

  ENDPOINTS: {
    CREATE: 'create-custom-rule',
    UPDATE: 'custom/update',
    DELETE: 'custom'
  },

  STORAGE_KEYS: {
    ACCESS_TOKEN: 'accessToken',
    AUTH_USER: 'authUser'
  },
};

export const MESSAGES = {
  API_INTERCEPTED: 'API_INTERCEPTED',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  GET_AUTH_STATUS: 'GET_AUTH_STATUS',
  RULE_LOADED: 'RULE_LOADED'
};
