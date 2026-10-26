import { useState } from 'react';
import { X, UserPlus, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui';
import type { AddVendorStaffPayload } from '../api';

const DUTY_PRESETS = [
  'Master Cutter / Butcher',
  'Counter & Billing',
  'Packaging & Dispatch',
  'Stall Operations Manager',
];

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: AddVendorStaffPayload) => void;
  isSubmitting: boolean;
}

export function AddStaffModal({ isOpen, onClose, onSubmit, isSubmitting }: AddStaffModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dutyTitle, setDutyTitle] = useState('Master Cutter / Butcher');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || undefined,
      dutyTitle: dutyTitle.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[1px] animate-in fade-in duration-150">
      <div className="bg-surface border border-border rounded-md w-full max-w-md p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            <div>
              <h3 className="text-base font-semibold text-text">Add Stall Staff Member</h3>
              <p className="text-xs text-muted">Butcher stall team and cutter access</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted hover:text-text p-1 rounded-md">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-medium text-text block mb-1">Staff Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Senthil Kumar"
              className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="font-medium text-text block mb-1">Email Address (Login ID)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="senthil.cuts@gmail.com"
              className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="font-medium text-text block mb-1">Mobile Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
            />
          </div>

          {/* Duty Preset Selection */}
          <div className="space-y-1.5">
            <label className="font-medium text-text block">Stall Duty Specialization</label>
            <div className="flex flex-wrap gap-1.5">
              {DUTY_PRESETS.map((preset) => {
                const isSelected = dutyTitle === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDutyTitle(preset)}
                    className={`px-2 py-1 text-xs font-medium rounded-md border transition-colors ${
                      isSelected
                        ? 'bg-primary text-white border-primary'
                        : 'bg-surface text-muted border-border hover:bg-surface-muted hover:text-text'
                    }`}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-2.5 rounded-md bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 flex items-start gap-2 text-[11px] text-purple-700 dark:text-purple-300">
            <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
            <span>Staff members receive portal sign-in credentials strictly scoped to your butcher stall products and orders.</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={isSubmitting}>
              Add & Send Invite
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
