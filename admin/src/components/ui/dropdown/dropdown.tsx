import { createContext, useCallback, useContext, useId, useRef, useState, type ReactNode } from 'react';
import { useClickOutside, useEscapeKey } from '@/hooks';
import { cn } from '@/lib/cn';

interface DropdownContextValue {
  close: () => void;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

export const useDropdown = (): DropdownContextValue => {
  const ctx = useContext(DropdownContext);
  if (!ctx) throw new Error('useDropdown must be used inside <Dropdown>');
  return ctx;
};

export interface DropdownTriggerRenderProps {
  open: boolean;
  /** Spread onto the trigger element: click handler + ARIA wiring. */
  triggerProps: {
    onClick: () => void;
    'aria-expanded': boolean;
    'aria-haspopup': 'menu';
    'aria-controls': string;
  };
}

export interface DropdownProps {
  /** `trigger={({ triggerProps }) => <Button {...triggerProps}>Menu</Button>}` */
  trigger: (props: DropdownTriggerRenderProps) => ReactNode;
  children: ReactNode;
  align?: 'start' | 'end';
  className?: string;
}

/** Menu anchored to its trigger. Closes on outside click, Escape, or when an item is chosen. */
export function Dropdown({ trigger, children, align = 'end', className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const close = useCallback(() => setOpen(false), []);

  useClickOutside([rootRef], close, open);
  useEscapeKey(close, open);

  return (
    <DropdownContext.Provider value={{ close }}>
      <div ref={rootRef} className="relative">
        {trigger({
          open,
          triggerProps: {
            onClick: () => setOpen((v) => !v),
            'aria-expanded': open,
            'aria-haspopup': 'menu',
            'aria-controls': menuId,
          },
        })}
        {open && (
          <div
            id={menuId}
            role="menu"
            className={cn(
              'absolute top-full z-50 mt-2 w-64 rounded-md border border-border bg-surface p-1',
              align === 'end' ? 'right-0' : 'left-0',
              className,
            )}
          >
            {children}
          </div>
        )}
      </div>
    </DropdownContext.Provider>
  );
}
