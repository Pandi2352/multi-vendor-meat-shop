import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReviewCard } from './review-card';
import type { ReviewResponse } from '../api/reviews.api';

describe('ReviewCard component', () => {
  const mockReview: ReviewResponse = {
    id: '018f67e5-1a2b-7c3d-8e4f-5a6b7c8d9e0f',
    shopId: '018f67e5-1a2b-7c3d-8e4f-000000000001',
    orderId: '018f67e5-1a2b-7c3d-8e4f-000000000002',
    customerId: '018f67e5-1a2b-7c3d-8e4f-000000000003',
    customerName: 'Karthik Raja',
    rating: 5,
    comment: 'Super fresh country chicken, perfect curry cut!',
    isVerifiedPurchase: true,
    createdAt: '2026-03-29T10:30:00.000Z',
  };

  it('renders customer name, rating, comment, and verified badge', () => {
    render(<ReviewCard review={mockReview} />);

    expect(screen.getByText('Karthik Raja')).toBeInTheDocument();
    expect(screen.getByText('Super fresh country chicken, perfect curry cut!')).toBeInTheDocument();
    expect(screen.getByText(/Verified Order/i)).toBeInTheDocument();
  });
});
