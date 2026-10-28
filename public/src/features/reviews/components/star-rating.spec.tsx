import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StarRating } from './star-rating';

describe('StarRating component', () => {
  it('renders 5 stars by default in readOnly mode', () => {
    const { container } = render(<StarRating value={4} readOnly />);
    const stars = container.querySelectorAll('svg');
    expect(stars.length).toBe(5);
  });

  it('renders interactive buttons when not in readOnly mode', () => {
    const handleChange = vi.fn();
    render(<StarRating value={3} onChange={handleChange} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(5);

    fireEvent.click(buttons[4]); // Click 5th star
    expect(handleChange).toHaveBeenCalledWith(5);
  });
});
