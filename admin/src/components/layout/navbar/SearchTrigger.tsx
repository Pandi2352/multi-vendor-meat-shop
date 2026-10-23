import { useMemo, useState, type KeyboardEvent } from 'react';
import { CornerDownLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, Dialog, Kbd } from '@/components/ui';
import { searchNav, type FlatNavEntry } from '@/config/nav.utils';
import { isMacPlatform, useHotkey } from '@/hooks';
import { cn } from '@/lib/cn';

/** "Search…" box in the navbar plus a Ctrl/⌘+K page switcher over the sidebar's pages. */
export function SearchTrigger() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const results = useMemo(() => searchNav(query), [query]);
  const modKey = isMacPlatform() ? '⌘' : 'Ctrl';

  const openSearch = () => {
    setQuery('');
    setActiveIndex(0);
    setOpen(true);
  };
  useHotkey('k', openSearch, { mod: true });

  const go = (entry: FlatNavEntry) => {
    setOpen(false);
    navigate(entry.to);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((i) => (results.length ? (i + step + results.length) % results.length : 0));
    }
    if (event.key === 'Enter' && results[activeIndex]) go(results[activeIndex]);
  };

  return (
    <>
      <button
        type="button"
        onClick={openSearch}
        className="hidden h-9 w-full max-w-xs items-center gap-2 rounded-md border border-border bg-surface-muted px-3 text-sm text-muted transition-colors hover:border-muted/40 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 md:flex"
      >
        <Search aria-hidden="true" className="h-4 w-4" />
        <span className="flex-1 text-left">Search pages…</span>
        <Kbd>{modKey}</Kbd>
        <Kbd>K</Kbd>
      </button>
      <Button variant="ghost" size="icon" onClick={openSearch} aria-label="Search" className="text-muted md:hidden">
        <Search className="h-5 w-5" strokeWidth={1.9} />
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} title="Search pages" hideTitle position="top">
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Go to orders, inventory, settlements…"
            aria-label="Search pages"
            className="h-12 flex-1 bg-transparent text-sm text-text outline-none placeholder:text-muted"
          />
          <Kbd>Esc</Kbd>
        </div>
        <ul role="listbox" aria-label="Pages" className="max-h-80 overflow-y-auto p-1.5">
          {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-muted">No pages match “{query}”.</li>}
          {results.map((entry, index) => (
            <li key={entry.to} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                onClick={() => go(entry)}
                onMouseMove={() => setActiveIndex(index)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left',
                  index === activeIndex ? 'bg-primary-soft' : 'hover:bg-surface-muted',
                )}
              >
                <entry.icon aria-hidden="true" className={cn('h-4 w-4 shrink-0', index === activeIndex ? 'text-primary' : 'text-muted')} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-text">{entry.label}</span>
                  {entry.description && <span className="block truncate text-xs text-muted">{entry.description}</span>}
                </span>
                {entry.soon && <Badge size="sm">Soon</Badge>}
                <span className="hidden shrink-0 text-xs text-muted sm:block">{entry.group ?? entry.section}</span>
                {index === activeIndex && <CornerDownLeft aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-muted" />}
              </button>
            </li>
          ))}
        </ul>
      </Dialog>
    </>
  );
}
