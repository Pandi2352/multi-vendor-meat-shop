const ADMIN_ACCESS_TOKEN_KEY = 'meat_shop_admin_access_token';
const ADMIN_REFRESH_TOKEN_KEY = 'meat_shop_admin_refresh_token';
const ADMIN_USER_KEY = 'meat_shop_admin_user';

let memoryAccessToken: string | null = null;

export const tokenStorage = {
  getAccessToken: (): string | null => {
    if (memoryAccessToken) return memoryAccessToken;
    try {
      memoryAccessToken = localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY);
      return memoryAccessToken;
    } catch {
      return null;
    }
  },

  setAccessToken: (token: string | null): void => {
    memoryAccessToken = token;
    try {
      if (token) {
        localStorage.setItem(ADMIN_ACCESS_TOKEN_KEY, token);
      } else {
        localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
      }
    } catch {
      // Storage unavailable or disabled
    }
  },

  getRefreshToken: (): string | null => {
    try {
      return localStorage.getItem(ADMIN_REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setRefreshToken: (token: string | null): void => {
    try {
      if (token) {
        localStorage.setItem(ADMIN_REFRESH_TOKEN_KEY, token);
      } else {
        localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY);
      }
    } catch {
      // Storage unavailable or disabled
    }
  },

  getUser: <T = unknown>(): T | null => {
    try {
      const data = localStorage.getItem(ADMIN_USER_KEY);
      return data ? (JSON.parse(data) as T) : null;
    } catch {
      return null;
    }
  },

  setUser: (user: unknown): void => {
    try {
      if (user) {
        localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(ADMIN_USER_KEY);
      }
    } catch {
      // Storage unavailable or disabled
    }
  },

  clearTokens: (): void => {
    memoryAccessToken = null;
    try {
      localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
      localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY);
      localStorage.removeItem(ADMIN_USER_KEY);
    } catch {
      // Storage unavailable or disabled
    }
  },
};
