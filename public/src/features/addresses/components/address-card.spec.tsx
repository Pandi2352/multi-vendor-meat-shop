import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddressCard } from './address-card';
import type { SavedAddress } from '../api/addresses.api';

describe('AddressCard component', () => {
  const mockAddress: SavedAddress = {
    id: 'addr-123',
    userId: 'user-456',
    label: 'HOME',
    text: '15 Madurai Road, Virudhunagar Town',
    pincode: '626001',
    district: 'Virudhunagar',
    isDefault: true,
    createdAt: '2026-03-29T10:00:00.000Z',
  };

  it('renders address details, label badge, and default status', () => {
    const handleEdit = vi.fn();
    const handleDelete = vi.fn();
    const handleSetDefault = vi.fn();

    render(
      <AddressCard
        address={mockAddress}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSetDefault={handleSetDefault}
      />,
    );

    expect(screen.getByText('HOME')).toBeInTheDocument();
    expect(screen.getByText('15 Madurai Road, Virudhunagar Town')).toBeInTheDocument();
    expect(screen.getByText('626001')).toBeInTheDocument();
    expect(screen.getByText(/Default Delivery/i)).toBeInTheDocument();
    expect(screen.getByText(/Primary Address/i)).toBeInTheDocument();
  });

  it('handles edit and delete clicks', () => {
    const handleEdit = vi.fn();
    const handleDelete = vi.fn();
    const handleSetDefault = vi.fn();

    render(
      <AddressCard
        address={{ ...mockAddress, isDefault: false }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSetDefault={handleSetDefault}
      />,
    );

    const makeDefaultBtn = screen.getByText('Make Default');
    fireEvent.click(makeDefaultBtn);
    expect(handleSetDefault).toHaveBeenCalledWith('addr-123');

    const editBtn = screen.getByText('Edit');
    fireEvent.click(editBtn);
    expect(handleEdit).toHaveBeenCalled();

    const deleteBtn = screen.getByText('Delete');
    fireEvent.click(deleteBtn);
    expect(handleDelete).toHaveBeenCalledWith('addr-123');
  });
});
