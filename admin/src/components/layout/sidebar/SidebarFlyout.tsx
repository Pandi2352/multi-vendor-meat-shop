import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';
import { sidebarFlyoutPanel, sidebarFlyoutTitle } from './sidebarStyles';

interface SidebarFlyoutProps {
  /** Only active while the sidebar is collapsed. */
  enabled: boolean;
  title: string;
  /** Extra panel content (e.g. a group's child links). Without it the flyout is a label tooltip. */
  content?: ReactNode;
  children: ReactNode;
}

const HIDE_DELAY_MS = 120;

/**
 * Panel to the right of a collapsed sidebar item, shown on hover or keyboard focus.
 * Rendered in a portal with fixed positioning so the scrolling nav never clips it.
 */
export function SidebarFlyout({ enabled, title, content, children }: SidebarFlyoutProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number | undefined>(undefined);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => () => window.clearTimeout(hideTimer.current), []);
  useEffect(() => {
    if (!enabled) setPosition(null);
  }, [enabled]);

  if (!enabled) return <>{children}</>;

  const show = () => {
    window.clearTimeout(hideTimer.current);
    const rect = anchorRef.current?.getBoundingClientRect();
    if (rect) setPosition({ top: rect.top, left: rect.right + 10 });
  };
  const hide = () => {
    hideTimer.current = window.setTimeout(() => setPosition(null), HIDE_DELAY_MS);
  };

  return (
    <div ref={anchorRef} onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {children}
      {position &&
        createPortal(
          <div
            style={{ top: position.top, left: position.left }}
            onMouseEnter={show}
            onMouseLeave={hide}
            className={cn(sidebarFlyoutPanel, !content && 'min-w-0 whitespace-nowrap')}
          >
            <div className={cn(content ? sidebarFlyoutTitle : 'px-2.5 py-1.5 text-sm font-medium text-text')}>
              {title}
            </div>
            {content}
          </div>,
          document.body,
        )}
    </div>
  );
}
