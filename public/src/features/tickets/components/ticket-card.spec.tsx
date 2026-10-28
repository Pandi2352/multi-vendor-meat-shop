import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TicketCard } from './ticket-card';
import type { SupportTicketResponse } from '../api/tickets.api';

describe('TicketCard', () => {
  const mockTicket: SupportTicketResponse = {
    id: 'tkt-123',
    ticketNumber: 'TKT-20261028-ABCDE',
    orderId: 'ord-456',
    orderNumber: 'ORD-20261028-0001',
    shopId: 'shop-789',
    customerId: 'cust-1',
    customerName: 'Pandi Selvam',
    reason: 'QUALITY_FRESHNESS',
    status: 'RESOLVED_REFUND_FULL',
    customerComments: 'The meat arrived warm and the thermal pouch was unsealed',
    evidencePhotoUrls: [],
    claimedAmountPaise: 35000,
    refundAmountPaise: 35000,
    resolutionNotes: 'Stall investigated, full refund processed to customer',
    createdAt: '2026-10-28T10:00:00.000Z',
    updatedAt: '2026-10-28T11:00:00.000Z',
  };

  it('renders ticket details, order link, customer comments, and refund approval', () => {
    render(
      <MemoryRouter>
        <TicketCard ticket={mockTicket} />
      </MemoryRouter>,
    );

    expect(screen.getByText('TKT-20261028-ABCDE')).toBeInTheDocument();
    expect(screen.getByText('ORD-20261028-0001')).toBeInTheDocument();
    expect(screen.getByText(/Freshness \/ Quality Issue/i)).toBeInTheDocument();
    expect(screen.getByText(/The meat arrived warm/i)).toBeInTheDocument();
    expect(screen.getByText(/Refund of ₹350 Approved/i)).toBeInTheDocument();
    expect(screen.getByText(/full refund processed to customer/i)).toBeInTheDocument();
  });
});
