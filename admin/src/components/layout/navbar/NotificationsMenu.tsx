import { Bell, BellOff } from 'lucide-react';
import { Button, Dropdown, DropdownItem, DropdownSeparator } from '@/components/ui';
import { cn } from '@/lib/cn';

export interface AppNotification {
  id: string;
  title: string;
  description?: string;
  /** Preformatted, e.g. "5 min ago". */
  timeLabel: string;
  to?: string;
  unread?: boolean;
}

interface NotificationsMenuProps {
  /** Wire to the notifications API when it exists; until then the menu shows its empty state. */
  notifications?: AppNotification[];
}

export function NotificationsMenu({ notifications = [] }: NotificationsMenuProps) {
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <Dropdown
      className="w-80"
      trigger={({ triggerProps }) => (
        <Button
          variant="ghost"
          size="icon"
          aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
          className="relative text-muted"
          {...triggerProps}
        >
          <Bell className="h-5 w-5" strokeWidth={1.9} />
          {unreadCount > 0 && (
            <span aria-hidden="true" className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-surface bg-primary" />
          )}
        </Button>
      )}
    >
      <div className="flex items-center justify-between px-2.5 py-2">
        <span className="text-sm font-semibold text-text">Notifications</span>
        {unreadCount > 0 && <span className="text-xs text-muted">{unreadCount} unread</span>}
      </div>
      <DropdownSeparator />

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-8 text-center">
          <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-surface-muted text-muted">
            <BellOff aria-hidden="true" className="h-5 w-5" />
          </span>
          <p className="text-sm font-medium text-text">You're all caught up</p>
          <p className="mt-1 text-xs text-muted">New orders, low stock and payout alerts will show up here.</p>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          {notifications.map((n) => (
            <DropdownItem
              key={n.id}
              to={n.to}
              label={n.title}
              description={n.description}
              icon={<span className={cn('mt-1.5 block h-2 w-2 rounded-full', n.unread ? 'bg-primary' : 'bg-border')} />}
              trailing={<span className="text-[11px] text-muted">{n.timeLabel}</span>}
            />
          ))}
        </div>
      )}
    </Dropdown>
  );
}
