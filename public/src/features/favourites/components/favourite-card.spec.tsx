import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FavouriteCard } from './favourite-card';
import type { FavouriteItem } from '../api/favourites.api';

describe('FavouriteCard', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const mockItem: FavouriteItem = {
    id: 'fav-1',
    productId: 'prod-1',
    productName: 'Chettinad Country Chicken Curry Cut',
    categoryName: 'Country Chicken',
    shopId: 'shop-1',
    shopName: 'Virudhunagar Chettinad Mutton Stall',
    pricePerKgPaise: 48000,
    minGrams: 500,
    maxGrams: 2000,
    stepGrams: 250,
    isAvailable: true,
    availableGrams: 15000,
    createdAt: '2026-10-28T08:00:00.000Z',
  };

  it('renders favourite item with stall name, live pricing, stock, and add to cart button', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <FavouriteCard item={mockItem} />
      </QueryClientProvider>,
    );

    expect(screen.getByText('Chettinad Country Chicken Curry Cut')).toBeInTheDocument();
    expect(screen.getByText('Virudhunagar Chettinad Mutton Stall')).toBeInTheDocument();
    expect(screen.getByText('Country Chicken')).toBeInTheDocument();
    expect(screen.getByText(/₹480 \/ kg/i)).toBeInTheDocument();
    expect(screen.getByText(/In Stock \(15 kg\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add to Cart/i })).toBeInTheDocument();
  });
});
