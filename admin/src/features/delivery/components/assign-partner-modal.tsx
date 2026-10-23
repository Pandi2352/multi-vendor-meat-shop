import { useState } from 'react';
import { UserCheck, X } from 'lucide-react';
import { Button } from '@/components/ui';

interface AssignPartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  onAssign: (partner: { partnerId: string; partnerName: string; partnerPhone: string }) => Promise<void>;
  isSubmitting?: boolean;
}

const ROSTER_RIDERS = [
  { partnerId: '018f1234-abcd-7000-8000-000000000005', partnerName: 'Karthik Raja', partnerPhone: '+919876543210' },
  { partnerId: '018f1234-abcd-7000-8000-000000000006', partnerName: 'Murugan Vel', partnerPhone: '+919876543211' },
  { partnerId: '018f1234-abcd-7000-8000-000000000007', partnerName: 'Senthil Kumar', partnerPhone: '+919876543212' },
];

export function AssignPartnerModal({
  isOpen,
  onClose,
  orderNumber,
  onAssign,
  isSubmitting,
}: AssignPartnerModalProps) {
  const [selectedId, setSelectedId] = useState(ROSTER_RIDERS[0].partnerId);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rider = ROSTER_RIDERS.find((r) => r.partnerId === selectedId) ?? ROSTER_RIDERS[0];
    await onAssign(rider);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-md border border-border bg-surface p-6">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold text-text">Dispatch Delivery Rider</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-muted hover:text-text rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-xs text-muted mt-3 mb-4">
          Assign an active hyper-local delivery partner for order <span className="font-semibold text-text">{orderNumber}</span>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-text">Available Active Fleet</label>
            {ROSTER_RIDERS.map((r) => (
              <label
                key={r.partnerId}
                className="flex items-center justify-between p-3 rounded-md border border-border bg-surface hover:bg-surface-muted cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="selectedRider"
                    checked={selectedId === r.partnerId}
                    onChange={() => setSelectedId(r.partnerId)}
                    className="text-primary focus:ring-primary"
                  />
                  <div>
                    <p className="text-xs font-semibold text-text">{r.partnerName}</p>
                    <p className="text-[11px] text-muted">{r.partnerPhone}</p>
                  </div>
                </div>
                <span className="text-[11px] text-success font-medium">Near Shop (1.2 km)</span>
              </label>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={isSubmitting}>
              Assign & Notify Courier
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
