import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Divider } from './divider';

describe('Divider component', () => {
  it('renders standard separator line', () => {
    render(<Divider />);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('renders labeled divider', () => {
    render(<Divider label="OR CONTINUE WITH" />);
    expect(screen.getByText('OR CONTINUE WITH')).toBeInTheDocument();
  });
});
