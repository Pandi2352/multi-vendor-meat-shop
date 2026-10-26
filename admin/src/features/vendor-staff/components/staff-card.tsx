import { Pencil, Power, Trash2, Phone, Mail, Award } from 'lucide-react';
import { Avatar } from '@/components/ui';
import type { VendorStaffMember } from '../api';
import { StaffStatusBadge } from './staff-status-badge';

interface StaffCardProps {
  member: VendorStaffMember;
  onEdit: (member: VendorStaffMember) => void;
  onToggleStatus: (member: VendorStaffMember) => void;
  onRemove: (member: VendorStaffMember) => void;
}

export function StaffCard({ member, onEdit, onToggleStatus, onRemove }: StaffCardProps) {
  const isOwner = member.role === 'VENDOR_OWNER';
  const isActive = member.status === 'ACTIVE';

  return (
    <div className="p-4 rounded-md border border-border bg-surface hover:border-primary/40 transition-colors flex flex-col justify-between space-y-3 text-xs">
      <div className="space-y-3">
        {/* Header: Avatar, Name, Status */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Avatar name={member.name} size="md" />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-text text-sm leading-tight">{member.name}</h3>
                {isOwner && (
                  <span className="px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 text-[10px] font-semibold">
                    Stall Owner
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-primary font-medium mt-0.5">
                <Award className="h-3 w-3" />
                <span>{member.dutyTitle || (isOwner ? 'Master Butcher & Owner' : 'Stall Staff')}</span>
              </div>
            </div>
          </div>
          <StaffStatusBadge status={member.status} />
        </div>

        {/* Contact Info */}
        <div className="p-2.5 rounded-md bg-surface-muted border border-border space-y-1.5 text-muted text-[11px]">
          <div className="flex items-center gap-1.5">
            <Mail className="h-3 w-3 shrink-0" />
            <span className="truncate text-text font-medium">{member.email}</span>
          </div>
          {member.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="h-3 w-3 shrink-0" />
              <span className="text-text font-medium">{member.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 border-t border-border flex items-center justify-between gap-1.5">
        {/* Edit Button */}
        <button
          type="button"
          onClick={() => onEdit(member)}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800"
        >
          <Pencil className="h-3 w-3 text-sky-600 dark:text-sky-400" />
          <span>Edit Details</span>
        </button>

        {!isOwner && (
          <div className="flex items-center gap-1.5">
            {/* Status toggle */}
            <button
              type="button"
              onClick={() => onToggleStatus(member)}
              title={isActive ? 'Suspend Staff Access' : 'Activate Staff'}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              }`}
            >
              <Power className="h-3 w-3" />
              <span>{isActive ? 'Suspend' : 'Activate'}</span>
            </button>

            {/* Remove */}
            <button
              type="button"
              onClick={() => onRemove(member)}
              title="Remove staff member"
              className="inline-flex items-center p-1 text-xs font-medium rounded-md transition-colors text-muted hover:text-rose-600 hover:bg-rose-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
