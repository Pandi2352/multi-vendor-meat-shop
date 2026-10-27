import { matchPath } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import type { UserRole } from '@/constants/roles';
import { NAV_SECTIONS, type NavChildLink, type NavItem, type NavSection } from './nav.config';
import { canAccessPath } from './route-access';

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
export const findNavEntry = (pathname: string, sections: NavSection[] = NAV_SECTIONS): FlatNavEntry | undefined =>
  flattenNav(sections)
    .filter((entry) => isPathActive(entry.to, pathname, entry.end))
    .sort((a, b) => b.to.length - a.to.length)[0];

export const searchNav = (query: string, sections: NavSection[] = NAV_SECTIONS): FlatNavEntry[] => {
  const term = query.trim().toLowerCase();
  const entries = flattenNav(sections);
  if (!term) return entries;
  return entries.filter((entry) =>
    [entry.label, entry.description, entry.section, entry.group].some((text) => text?.toLowerCase().includes(term)),
  );
};

/**
 * The nav a role may see, using the same rules as the route guard (`ROUTE_ACCESS`).
 * Groups without a visible child and sections without a visible item are dropped.
 */
export const filterNavForRole = (role: UserRole, sections: NavSection[] = NAV_SECTIONS): NavSection[] =>
  sections
    .map((section) => ({
      ...section,
      items: section.items
        .map((item): NavItem | null => {
          if (item.type === 'link') return canAccessPath(role, item.to) ? item : null;
          const children = item.children.filter((child) => canAccessPath(role, child.to));
          return children.length ? { ...item, children } : null;
        })
        .filter((item): item is NavItem => item !== null),
    }))
    .filter((section) => section.items.length > 0);
