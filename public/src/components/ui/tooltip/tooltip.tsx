import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';

export type TooltipSide = 'top' | 'right' | 'bottom' | 'left';

export interface TooltipProps {
  content: ReactNode;
  side?: TooltipSide;
  /** Delay before showing, in ms. Hiding is immediate. */
  delay?: number;
  disabled?: boolean;
  /** Classes for the wrapper that measures the trigger (e.g. `flex w-full`). */
  className?: string;
  children: ReactNode;
}

const GAP = 10;

const placement = (rect: DOMRect, side: TooltipSide): CSSProperties => {
  switch (side) {
    case 'top':
      return { left: rect.left + rect.width / 2, top: rect.top - GAP, translate: '-50% -100%' };
    case 'bottom':
      return { left: rect.left + rect.width / 2, top: rect.bottom + GAP, translate: '-50% 0' };
    case 'left':
      return { left: rect.left - GAP, top: rect.top + rect.height / 2, translate: '-100% -50%' };
    default:
      return { left: rect.right + GAP, top: rect.top + rect.height / 2, translate: '0 -50%' };
  }
};

const ARROW_CLASS: Record<TooltipSide, string> = {
  top: 'left-1/2 top-full -translate-x-1/2 -translate-y-1/2',
  bottom: 'left-1/2 bottom-full -translate-x-1/2 translate-y-1/2',
  left: 'left-full top-1/2 -translate-x-1/2 -translate-y-1/2',
  right: 'right-full top-1/2 translate-x-1/2 -translate-y-1/2',
};

/**
 * Dark label chip with an arrow, shown on hover and keyboard focus.
 * Portaled with fixed positioning so scroll containers never clip it; hides on scroll.
 */
export function Tooltip({ content, side = 'top', delay = 300, disabled, className, children }: TooltipProps) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const [style, setStyle] = useState<CSSProperties | null>(null);
  const id = useId();

  const hide = () => {
    window.clearTimeout(timer.current);
    setStyle(null);
  };

  const show = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (rect) setStyle(placement(rect, side));
    }, delay);
  };

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    if (!style) return;
    window.addEventListener('scroll', hide, true);
    window.addEventListener('resize', hide);
    return () => {
      window.removeEventListener('scroll', hide, true);
      window.removeEventListener('resize', hide);
    };
  }, [style]);
  useEffect(() => {
    if (disabled) hide();
  }, [disabled]);

  if (disabled) return <>{children}</>;

  return (
    <span
      ref={anchorRef}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onPointerDown={hide}
      aria-describedby={style ? id : undefined}
      className={cn('inline-flex', className)}
    >
      {children}
      {style &&
        createPortal(
          <span
            id={id}
            role="tooltip"
            style={style}
            className="pointer-events-none fixed z-60 flex items-center gap-2 whitespace-nowrap rounded-md bg-tooltip px-2.5 py-1.5 text-xs font-medium text-tooltip-foreground motion-safe:animate-pop-in"
          >
            <span aria-hidden="true" className={cn('absolute h-2 w-2 rotate-45 bg-tooltip', ARROW_CLASS[side])} />
            <span className="relative">{content}</span>
          </span>,
          document.body,
        )}
    </span>
  );
}
