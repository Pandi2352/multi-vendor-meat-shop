import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Alert } from './alert';

describe('Alert component', () => {
  it('renders title and children with info tone by default', () => {
    render(<Alert title="Notice">This is an informational message.</Alert>);

    expect(screen.getByText('Notice')).toBeInTheDocument();
    expect(screen.getByText('This is an informational message.')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders danger alert with alert role for accessibility', () => {
    render(<Alert tone="danger" title="Error">Something failed.</Alert>);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
  });
});
