import { WifiOff } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/use-network-status';

export function OfflineBanner() {
  const { isOnline } = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div
      role="alert"
      className="sticky top-0 z-70 flex w-full items-center justify-center gap-2 border-b border-danger/40 bg-danger px-4 py-2 text-xs font-semibold text-white animate-in slide-in-from-top duration-200"
    >
      <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>You are currently offline. Check your internet connection. Live inventory and tracking may be delayed.</span>
    </div>
  );
}
