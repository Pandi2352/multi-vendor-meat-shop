import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Tooltip } from './tooltip';

describe('Tooltip component', () => {
  it('renders children trigger properly', () => {
    render(
      <Tooltip content="Tooltip details">
        <button type="button">Hover me</button>
      </Tooltip>
    );

    expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument();
  });

  it('renders plain children when disabled', () => {
    render(
      <Tooltip content="Tooltip details" disabled>
        <span>Disabled trigger</span>
      </Tooltip>
    );

    expect(screen.getByText('Disabled trigger')).toBeInTheDocument();
  });
});
