// Builds Vitest aliases from the `imports` field in package.json so aliases are defined in one place.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface ImportTarget {
  source: string;
}

const pkg = JSON.parse(readFileSync(resolve(import.meta.dirname, 'package.json'), 'utf8')) as {
  imports: Record<string, ImportTarget>;
};

export const importAliases = Object.entries(pkg.imports).map(([key, target]) => {
  const source = resolve(import.meta.dirname, target.source);
  if (!key.includes('*')) return { find: new RegExp(`^${key}$`), replacement: source };
  return {
    find: new RegExp(`^${key.replace('*', '(.+)')}$`),
    replacement: source.replace('*', '$1'),
  };
});
