import { useState } from 'react';
import { AlertCircle, HelpCircle, X } from 'lucide-react';
import { Alert, Button, toast } from '@/components/ui';
import { getErrorMessage } from '@/lib/api-error';
import { formatINR } from '@/utils';
import { useCreateTicket } from '../api/use-tickets';
import type { DisputeReason, SupportTicketResponse } from '../api/tickets.api';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: string;
  orderTotalPaise: number;
  onCreated?: (ticket: SupportTicketResponse) => void;
}

const REASONS: { value: DisputeReason; label: string }[] = [
  { value: 'QUALITY_FRESHNESS', label: 'Freshness / Quality Issue (Warm meat / Off smell)' },
  { value: 'UNDERWEIGHT', label: 'Weight Deficit (Weighed less than packed slip)' },
  { value: 'WRONG_CUT', label: 'Wrong Cut Type (Received curry cut instead of biryani)' },
  { value: 'WRONG_ITEM', label: 'Wrong Item Delivered' },
  { value: 'MISSING_ITEMS', label: 'Missing Item from Order' },
  { value: 'CONTAMINATION', label: 'Contamination or Dirt' },
  { value: 'DELIVERY_DELAY', label: 'Severe Delivery Delay' },
  { value: 'OTHER', label: 'Other Issue' },
];

export function CreateTicketModal({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  orderTotalPaise,
  onCreated,
}: CreateTicketModalProps) {
  const [reason, setReason] = useState<DisputeReason>('QUALITY_FRESHNESS');
  const [comments, setComments] = useState('');
  const [error, setError] = useState<string | null>(null);

  const createTicket = useCreateTicket();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (comments.trim().length < 10) {
      setError('Please provide at least 10 characters describing the issue');
      return;
    }

    setError(null);
    try {
      const ticket = await createTicket.mutateAsync({
        orderId,
        reason,
        customerComments: comments.trim(),
        claimedAmountPaise: orderTotalPaise,
      });

      toast.success(`Support Ticket ${ticket.ticketNumber} created. Our team will review within 2 hours.`);
      onCreated?.(ticket);
      onClose();
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Failed to submit issue ticket');
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-md border border-border bg-surface p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-md text-muted hover:text-text hover:bg-surface-muted transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-text">Report Order Issue</h3>
          </div>
          <p className="text-xs text-muted">
            Order Reference: <span className="font-mono font-medium text-text">{orderNumber}</span>
          </p>
        </div>

        {error && (
          <div className="mb-4">
            <Alert tone="danger">{error}</Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text mb-1">Issue Category</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as DisputeReason)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
            >
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1">Explain What Happened</label>
            <textarea
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Describe the complaint in detail (e.g. ice pouch melted, received broiler instead of country chicken)..."
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="rounded-md border border-border bg-surface-muted p-3 text-xs flex items-center justify-between">
            <span className="text-muted">Requested Refund Amount:</span>
            <span className="font-bold text-text">{formatINR(orderTotalPaise)}</span>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" fullWidth onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              fullWidth
              loading={createTicket.isPending}
              leftIcon={<AlertCircle className="h-4 w-4" />}
            >
              Submit Ticket
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
