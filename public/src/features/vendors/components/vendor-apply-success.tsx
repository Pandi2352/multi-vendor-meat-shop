import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui';
import type { VendorApplicationResponse } from '../api/vendor-apply.api';

interface VendorApplySuccessProps {
  result: VendorApplicationResponse;
  fssaiNumber: string;
  onClose: () => void;
}

export function VendorApplySuccess({ result, fssaiNumber, onClose }: VendorApplySuccessProps) {
  return (
    <div className="p-6 text-center space-y-4 overflow-y-auto">
      <div className="h-12 w-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
        <CheckCircle2 className="h-7 w-7" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-text">Application Submitted!</h3>
        <p className="text-xs text-muted mt-1">விண்ணப்பம் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது</p>
      </div>
      <div className="p-3 bg-surface-muted border border-border rounded-md text-xs text-left space-y-1">
        <p className="text-muted">
          Application Ref: <span className="font-mono text-text">{result.applicationId}</span>
        </p>
        <p className="text-muted">
          Status: <span className="font-semibold text-primary">{result.status}</span>
        </p>
        <p className="text-xs text-text mt-2">
          Our Virudhunagar marketplace team will verify your FSSAI certificate ({fssaiNumber}) and open your stall within 24 hours.
        </p>
      </div>
      <Button variant="primary" className="w-full" onClick={onClose}>
        Done / முடிந்தது
      </Button>
    </div>
  );
}
