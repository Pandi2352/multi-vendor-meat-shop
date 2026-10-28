import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Skeleton } from './skeleton';

describe('Skeleton component', () => {
  it('renders rectangular placeholder with animate-pulse', () => {
    const { container } = render(<Skeleton className="h-6 w-32" />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass('animate-pulse');
    expect(el).toHaveClass('rounded-md');
  });

  it('renders circular variant for avatar placeholders', () => {
    const { container } = render(<Skeleton variant="circular" className="h-10 w-10" />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass('rounded-full');
  });
});
