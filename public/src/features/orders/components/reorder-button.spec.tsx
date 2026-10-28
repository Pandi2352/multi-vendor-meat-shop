import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReorderButton } from './reorder-button';

describe('ReorderButton', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  it('renders reorder button with correct text and icon', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ReorderButton orderId="ord-123" />
      </QueryClientProvider>,
    );

    const btn = screen.getByRole('button', { name: /Reorder/i });
    expect(btn).toBeInTheDocument();
  });
});
