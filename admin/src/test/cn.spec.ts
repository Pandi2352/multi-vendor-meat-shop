import { describe, expect, it } from 'vitest';
import { cn } from '@/lib/cn';

describe('cn utility', () => {
  it('merges class names correctly', () => {
    expect(cn('p-4', 'bg-surface')).toBe('p-4 bg-surface');
  });

  it('handles conflicting tailwind classes', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });
});
