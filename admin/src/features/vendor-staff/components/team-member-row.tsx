import { MoreHorizontal, Pencil, PauseCircle, PlayCircle, UserMinus } from 'lucide-react';
import { Avatar, Badge, Button, Dropdown, DropdownItem } from '@/components/ui';
import type { VendorStaffMember } from '../api';
import { StaffStatusBadge } from './staff-status-badge';

interface TeamMemberRowProps {
  member: VendorStaffMember;
  onEdit: (member: VendorStaffMember) => void;
  onToggleSuspend: (member: VendorStaffMember) => void;
  onRemove: (member: VendorStaffMember) => void;
}

/** One person on the team. The owner's row has no actions (the server refuses them anyway). */
export function TeamMemberRow({ member, onEdit, onToggleSuspend, onRemove }: TeamMemberRowProps) {
  const isOwner = member.role === 'VENDOR_OWNER';
  const suspended = member.status === 'SUSPENDED';

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <Avatar name={member.name} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-medium text-text">{member.name}</span>
          {isOwner ? (
            <Badge tone="primary" size="sm">
              Owner
            </Badge>
          ) : (
            <StaffStatusBadge status={member.status} />
          )}
        </div>
        <p className="truncate text-xs text-muted">
          {[member.dutyTitle, member.email, member.phone].filter(Boolean).join(' · ')}
        </p>
      </div>
      {!isOwner && (
        <Dropdown
          trigger={({ triggerProps }) => (
            <Button variant="ghost" size="icon" aria-label={`Actions for ${member.name}`} {...triggerProps}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          )}
        >
          <DropdownItem icon={<Pencil className="h-4 w-4" />} label="Edit details" onSelect={() => onEdit(member)} />
          <DropdownItem
            icon={suspended ? <PlayCircle className="h-4 w-4" /> : <PauseCircle className="h-4 w-4" />}
            label={suspended ? 'Re-activate' : 'Suspend'}
            description={suspended ? 'Let them sign in again' : 'Blocks sign-in until you re-activate'}
            onSelect={() => onToggleSuspend(member)}
          />
          <DropdownItem
            icon={<UserMinus className="h-4 w-4" />}
            label="Remove from shop"
            tone="danger"
            onSelect={() => onRemove(member)}
          />
        </Dropdown>
      )}
    </li>
  );
}
