const KEY = 'meat_shop_admin:pending-sign-in';

export interface PendingSignIn {
  email: string;
  /** Epoch ms when "Resend code" becomes available. */
  resendAt: number;
}

/**
 * Hands the email from the sign-in page to the verify page. Kept in sessionStorage so a refresh
 * on /login/verify still works, and it never outlives the tab.
 */
export const pendingSignIn = {
  save(email: string, cooldownSeconds: number): void {
    const value: PendingSignIn = { email, resendAt: Date.now() + cooldownSeconds * 1000 };
    try {
      sessionStorage.setItem(KEY, JSON.stringify(value));
    } catch {
      // Storage blocked: the verify page falls back to asking for the email again.
    }
  },

  read(): PendingSignIn | null {
    try {
      const raw = sessionStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as PendingSignIn) : null;
    } catch {
      return null;
    }
  },

  clear(): void {
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      // Storage unavailable
    }
  },
};
