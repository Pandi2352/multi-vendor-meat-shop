import React from 'react';
import { cn } from '@/lib/cn';

export interface TabItem<T extends string = string> {
  key: T;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
  alert?: boolean;
  disabled?: boolean;
}

export interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (key: T) => void;
  className?: string;
  tabClassName?: string;
  size?: 'sm' | 'md';
}

/**
 * Compact, light-color, professional segmented tab bar.
 * Built to replace bulky, lengthy tab blocks with crisp, subtle surfaces.
 */
export function Tabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className,
  tabClassName,
  size = 'md',
}: TabsProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center gap-1 p-0.5 rounded-md bg-surface-muted/60 border border-border max-w-full overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden box-border',
        size === 'sm' ? 'h-7' : 'h-8',
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const Icon = tab.icon;

        return (
          <button
            key={tab.key}
            role="tab"
            type="button"
            aria-selected={isActive}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.key)}
            className={cn(
              'inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 transition-all font-medium cursor-pointer box-border select-none shrink-0',
              size === 'sm' ? 'h-[22px] text-[11px]' : 'h-[26px] text-xs',
              isActive
                ? 'bg-surface text-text font-semibold border border-border/80'
                : 'text-muted hover:text-text hover:bg-surface/50 border border-transparent',
              tab.disabled && 'cursor-not-allowed opacity-40 hover:bg-transparent',
              tabClassName,
            )}
          >
            {Icon && (
              <Icon
                className={cn(
                  'shrink-0',
                  size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5',
                  isActive ? 'text-primary' : 'text-muted',
                )}
              />
            )}
            <span>{tab.label}</span>

            {typeof tab.count === 'number' && (
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[10px] leading-tight font-semibold transition-colors',
                  tab.alert
                    ? 'bg-amber-500/15 text-amber-600'
                    : isActive
                    ? 'bg-primary/10 text-primary'
                    : 'bg-surface-muted text-muted',
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
