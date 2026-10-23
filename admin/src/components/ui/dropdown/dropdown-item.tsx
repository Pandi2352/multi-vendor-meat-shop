import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { useDropdown } from './dropdown';

export interface DropdownItemProps {
  icon?: ReactNode;
  label: string;
  description?: string;
  /** Navigate on select. */
  to?: string;
  onSelect?: () => void;
  tone?: 'default' | 'danger';
  trailing?: ReactNode;
}

const itemClass = (tone: DropdownItemProps['tone']) =>
  cn(
    'flex w-full items-start gap-3 rounded-md px-2.5 py-2 text-left text-sm transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
    tone === 'danger' ? 'text-danger hover:bg-danger-soft' : 'text-text hover:bg-surface-muted',
  );

export function DropdownItem({ icon, label, description, to, onSelect, tone = 'default', trailing }: DropdownItemProps) {
  const { close } = useDropdown();
  const handleSelect = () => {
    onSelect?.();
    close();
  };

  const content = (
    <>
      {icon && <span className={cn('mt-0.5 shrink-0', tone === 'danger' ? 'text-danger' : 'text-muted')}>{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block font-medium leading-5">{label}</span>
        {description && <span className="block text-xs leading-4 text-muted">{description}</span>}
      </span>
      {trailing && <span className="shrink-0 self-center">{trailing}</span>}
    </>
  );

  if (to) {
    return (
      <Link role="menuitem" to={to} onClick={handleSelect} className={itemClass(tone)}>
        {content}
      </Link>
    );
  }
  return (
    <button role="menuitem" type="button" onClick={handleSelect} className={itemClass(tone)}>
      {content}
    </button>
  );
}
