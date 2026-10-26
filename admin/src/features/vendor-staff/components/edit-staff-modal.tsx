import { useState, useEffect } from 'react';
import { X, Pencil } from 'lucide-react';
import { Button } from '@/components/ui';
import type { VendorStaffMember, UpdateVendorStaffPayload } from '../api';

const DUTY_PRESETS = [
  'Master Cutter / Butcher',
  'Counter & Billing',
  'Packaging & Dispatch',
  'Stall Operations Manager',
];

interface EditStaffModalProps {
  member: VendorStaffMember | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, payload: UpdateVendorStaffPayload) => void;
  isSubmitting: boolean;
}

export function EditStaffModal({ member, isOpen, onClose, onSubmit, isSubmitting }: EditStaffModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dutyTitle, setDutyTitle] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'SUSPENDED'>('ACTIVE');

  useEffect(() => {
    if (member) {
      setName(member.name || '');
      setPhone(member.phone || '');
      setDutyTitle(member.dutyTitle || 'Master Cutter / Butcher');
      setStatus(member.status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE');
    }
  }, [member, isOpen]);

  if (!isOpen || !member) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(member.id, {
      name: name.trim(),
      phone: phone.trim() || undefined,
      dutyTitle: dutyTitle.trim() || undefined,
      status,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[1px] animate-in fade-in duration-150">
      <div className="bg-surface border border-border rounded-md w-full max-w-md p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-sky-600" />
            <div>
              <h3 className="text-base font-semibold text-text">Edit Staff Member</h3>
              <p className="text-xs text-muted">{member.email}</p>
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

          <div>
            <label className="font-medium text-text block mb-1">Stall Access Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'SUSPENDED')}
              className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
            >
              <option value="ACTIVE">Active (Can log in & manage orders)</option>
              <option value="SUSPENDED">Suspended (Access paused)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
