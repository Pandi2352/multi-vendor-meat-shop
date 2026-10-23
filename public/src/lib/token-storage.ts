const ACCESS_TOKEN_KEY = 'meat_shop_access_token';
const REFRESH_TOKEN_KEY = 'meat_shop_refresh_token';

let memoryAccessToken: string | null = null;

export const tokenStorage = {
  getAccessToken: (): string | null => {
    if (memoryAccessToken) return memoryAccessToken;
    try {
      memoryAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      return memoryAccessToken;
    } catch {
      return null;
    }
  },

  setAccessToken: (token: string | null): void => {
    memoryAccessToken = token;
    try {
      if (token) {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
      } else {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
      }
    } catch {
      // Storage unavailable or disabled
    }
  },

  getRefreshToken: (): string | null => {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setRefreshToken: (token: string | null): void => {
    try {
      if (token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
      } else {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      }
    } catch {
      // Storage unavailable or disabled
    }
  },

  clearTokens: (): void => {
    memoryAccessToken = null;
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch {
      // Storage unavailable or disabled
    }
  },
};
