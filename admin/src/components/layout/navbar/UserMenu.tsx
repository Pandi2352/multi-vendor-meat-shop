import { ChevronDown, CircleHelp, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Dropdown, DropdownItem, DropdownSeparator } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { SIGN_IN_REASON } from '@/features/auth';
import { useCurrentUser } from '@/hooks';
import { cn } from '@/lib/cn';
import { tokenStorage } from '@/lib/token-storage';

export function UserMenu() {
  const user = useCurrentUser();
  const navigate = useNavigate();

  const signOut = () => {
    tokenStorage.clearTokens();
    navigate(`${ROUTES.LOGIN}?reason=${SIGN_IN_REASON.SIGNED_OUT}`, { replace: true });
  };

  return (
    <Dropdown
      trigger={({ open, triggerProps }) => (
        <button
          type="button"
          aria-label="Account menu"
          className={cn(
            'flex items-center gap-2.5 rounded-md p-1 pr-1.5 transition-colors hover:bg-surface-muted',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
            open && 'bg-surface-muted',
          )}
          {...triggerProps}
        >
          <Avatar name={user.name} size="sm" />
          <span className="hidden text-left lg:block">
            <span className="block text-sm font-medium leading-4 text-text">{user.name}</span>
            <span className="block text-xs leading-4 text-muted">{user.roleLabel}</span>
          </span>
          <ChevronDown
            aria-hidden="true"
            className={cn('hidden h-4 w-4 text-muted transition-transform lg:block', open && 'rotate-180')}
          />
        </button>
      )}
    >
      <div className="flex items-center gap-3 px-2.5 py-2.5">
        <Avatar name={user.name} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-text">{user.name}</p>
          <p className="truncate text-xs text-muted">{user.email}</p>
        </div>
      </div>
      <DropdownSeparator />
      <DropdownItem to={ROUTES.SETTINGS} label="Account settings" icon={<Settings className="h-4 w-4" />} />
      <DropdownItem to={ROUTES.SUPPORT} label="Help & support" icon={<CircleHelp className="h-4 w-4" />} />
      <DropdownSeparator />
      <DropdownItem label="Sign out" tone="danger" onSelect={signOut} icon={<LogOut className="h-4 w-4" />} />
    </Dropdown>
  );
}
