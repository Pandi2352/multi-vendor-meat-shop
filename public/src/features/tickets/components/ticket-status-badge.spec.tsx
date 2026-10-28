import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TicketStatusBadge } from './ticket-status-badge';

describe('TicketStatusBadge', () => {
  it('renders Open badge with warning styling', () => {
    render(<TicketStatusBadge status="OPEN" />);
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('renders Full Refund Approved with success styling', () => {
    render(<TicketStatusBadge status="RESOLVED_REFUND_FULL" />);
    expect(screen.getByText('Full Refund Approved')).toBeInTheDocument();
  });

  it('renders Claim Rejected with danger styling', () => {
    render(<TicketStatusBadge status="RESOLVED_REJECTED" />);
    expect(screen.getByText('Claim Rejected')).toBeInTheDocument();
  });
});
