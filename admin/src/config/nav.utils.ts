import { matchPath } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { NAV_SECTIONS, type NavChildLink, type NavSection } from './nav.config';

export interface FlatNavEntry {
  label: string;
  to: string;
  description?: string;
  soon?: boolean;
  icon: LucideIcon;
  section: string;
  /** Parent group label for grouped links. */
  group?: string;
  end?: boolean;
}

/** Every navigable page, in sidebar order. */
export const flattenNav = (sections: NavSection[] = NAV_SECTIONS): FlatNavEntry[] =>
  sections.flatMap((section) =>
    section.items.flatMap((item): FlatNavEntry[] =>
      item.type === 'link'
        ? [{ ...item, section: section.label }]
        : item.children.map((child: NavChildLink) => ({
            ...child,
            icon: item.icon,
            section: section.label,
            group: item.label,
          })),
    ),
  );

export const isPathActive = (to: string, pathname: string, end = false): boolean =>
  matchPath({ path: to, end }, pathname) !== null;

/** Nav entry for the current URL (longest match wins, so `/vendor/orders/123` → Orders). */
export const findNavEntry = (pathname: string): FlatNavEntry | undefined =>
  flattenNav()
    .filter((entry) => isPathActive(entry.to, pathname, entry.end))
    .sort((a, b) => b.to.length - a.to.length)[0];

export const searchNav = (query: string): FlatNavEntry[] => {
  const term = query.trim().toLowerCase();
  const entries = flattenNav();
  if (!term) return entries;
  return entries.filter((entry) =>
    [entry.label, entry.description, entry.section, entry.group].some((text) => text?.toLowerCase().includes(term)),
  );
};
