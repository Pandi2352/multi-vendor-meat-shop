const ADMIN_ACCESS_TOKEN_KEY = 'meat_shop_admin_access_token';
const ADMIN_REFRESH_TOKEN_KEY = 'meat_shop_admin_refresh_token';

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

  clearTokens: (): void => {
    memoryAccessToken = null;
    try {
      localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
      localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY);
    } catch {
      // Storage unavailable or disabled
    }
  },
};
