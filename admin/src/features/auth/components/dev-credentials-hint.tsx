import { devLogin } from '@/config/env';

/**
 * Local test login from VITE_DEV_LOGIN_EMAIL / VITE_DEV_LOGIN_PASSWORD (admin/.env.development).
 * Renders nothing when they aren't set — always the case in production builds.
 */
export function DevCredentialsHint({ onFill }: { onFill: (credentials: { email: string; password: string }) => void }) {
  if (!devLogin) return null;

  return (
    <div className="space-y-2 rounded-md border border-dashed border-border bg-surface-muted p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-text">Dev only · test login from .env.development</span>
        <button type="button" onClick={() => onFill(devLogin!)} className="text-xs font-medium text-primary hover:underline">
          Auto-fill
        </button>
      </div>
      <p className="select-all break-all font-mono text-xs text-text">{devLogin.email}</p>
    </div>
  );
}
