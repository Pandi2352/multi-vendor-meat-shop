import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './empty-state';

describe('EmptyState component', () => {
  it('renders title, description and action button', () => {
    render(
      <EmptyState
        title="No fresh cuts available"
        description="Try selecting a different butcher stall nearby."
        actionLabel="Explore other stalls"
        onAction={() => {}}
      />
    );

    expect(screen.getByText('No fresh cuts available')).toBeInTheDocument();
    expect(screen.getByText('Try selecting a different butcher stall nearby.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Explore other stalls' })).toBeInTheDocument();
  });
});
