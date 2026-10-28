import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';

interface OrderCancellationPromptProps {
  onConfirm: (reason: string) => void;
  isLoading: boolean;
}

export function OrderCancellationPrompt({ onConfirm, isLoading }: OrderCancellationPromptProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [reason, setReason] = useState('');

  if (!showPrompt) {
    return (
      <Button variant="danger" size="sm" onClick={() => setShowPrompt(true)}>
        Cancel Order
      </Button>
    );
  }

  return (
    <div className="p-3 rounded-md border border-danger/30 bg-danger/10 space-y-2">
      <p className="text-xs font-semibold text-danger flex items-center gap-1">
        <AlertCircle className="h-3.5 w-3.5" /> Confirm cancellation?
      </p>
      <input
        type="text"
        placeholder="Reason for cancellation (optional)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full text-xs rounded-md border border-border bg-surface px-2.5 py-1.5 text-text"
      />
      <div className="flex gap-2 pt-1">
        <Button
          variant="danger"
          size="sm"
          loading={isLoading}
          onClick={() => onConfirm(reason)}
        >
          Yes, Cancel Order
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowPrompt(false)}>
          Keep Order
        </Button>
      </div>
    </div>
  );
}
