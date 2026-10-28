import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CouponInput } from './coupon-input';

const renderWithClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe('CouponInput component', () => {
  it('renders promo code input and disabled apply button initially', () => {
    const handleApply = vi.fn();
    const handleRemove = vi.fn();

    renderWithClient(
      <CouponInput
        subtotalPaise={25000}
        appliedCoupon={null}
        onApply={handleApply}
        onRemove={handleRemove}
      />,
    );

    const input = screen.getByPlaceholderText('PROMO CODE');
    expect(input).toBeInTheDocument();

    const applyBtn = screen.getByRole('button', { name: /Apply/i });
    expect(applyBtn).toBeDisabled();

    fireEvent.change(input, { target: { value: 'firstmeat50' } });
    expect(input).toHaveValue('FIRSTMEAT50');
    expect(applyBtn).not.toBeDisabled();
  });

  it('renders applied coupon badge and remove button when coupon is active', () => {
    const handleApply = vi.fn();
    const handleRemove = vi.fn();

    renderWithClient(
      <CouponInput
        subtotalPaise={25000}
        appliedCoupon={{ code: 'FIRSTMEAT50', discountPaise: 5000 }}
        onApply={handleApply}
        onRemove={handleRemove}
      />,
    );

    expect(screen.getByText('FIRSTMEAT50')).toBeInTheDocument();
    expect(screen.getByText('APPLIED')).toBeInTheDocument();
    expect(screen.getByText(/You saved ₹50 on this order!/i)).toBeInTheDocument();

    const removeBtn = screen.getByTitle('Remove coupon');
    fireEvent.click(removeBtn);
    expect(handleRemove).toHaveBeenCalledTimes(1);
  });
});
