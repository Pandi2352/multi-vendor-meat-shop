import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { sidebarFlyoutArrow, sidebarFlyoutPanel, sidebarFlyoutTitle } from './sidebarStyles';

interface SidebarFlyoutProps {
  /** Only active while the sidebar is collapsed. */
  enabled: boolean;
  title: string;
  /** Panel body, e.g. a group's child links. */
  content: ReactNode;
  children: ReactNode;
}

const HIDE_DELAY_MS = 140;
const GAP_PX = 12;

/**
 * Light panel to the right of a collapsed sidebar group, opened on hover or keyboard focus.
 * Stays open while the pointer travels into it. Portaled so the scrolling nav never clips it.
 * (Plain links use the dark `Tooltip` instead.)
 */
export function SidebarFlyout({ enabled, title, content, children }: SidebarFlyoutProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number | undefined>(undefined);
  const [position, setPosition] = useState<{ top: number; left: number; arrowTop: number } | null>(null);

  useEffect(() => () => window.clearTimeout(hideTimer.current), []);
  useEffect(() => {
    if (!enabled) setPosition(null);
  }, [enabled]);

  if (!enabled) return <>{children}</>;

  const show = () => {
    window.clearTimeout(hideTimer.current);
    const rect = anchorRef.current?.getBoundingClientRect();
    if (rect) setPosition({ top: rect.top - 4, left: rect.right + GAP_PX, arrowTop: rect.height / 2 + 4 });
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
            className={sidebarFlyoutPanel}
          >
            {/* Invisible bridge over the gap so the pointer can cross from icon to panel. */}
            <span aria-hidden="true" className="absolute inset-y-0 right-full w-3" />
            <span aria-hidden="true" style={{ top: position.arrowTop }} className={sidebarFlyoutArrow} />
            <div className={sidebarFlyoutTitle}>{title}</div>
            {content}
          </div>,
          document.body,
        )}
    </div>
  );
}
