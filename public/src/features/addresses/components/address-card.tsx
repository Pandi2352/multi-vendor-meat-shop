import { Home, Briefcase, MapPin, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import type { SavedAddress } from '../api/addresses.api';

interface AddressCardProps {
  address: SavedAddress;
  onEdit: (address: SavedAddress) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
  isDeleting?: boolean;
  isSettingDefault?: boolean;
}

export function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  isDeleting,
  isSettingDefault,
}: AddressCardProps) {
  const getIcon = () => {
    if (address.label === 'WORK') return <Briefcase className="h-4 w-4" />;
    if (address.label === 'HOME') return <Home className="h-4 w-4" />;
    return <MapPin className="h-4 w-4" />;
  };

  return (
    <div
      className={`rounded-md border p-4 transition-all flex flex-col justify-between ${
        address.isDefault
          ? 'border-primary/50 bg-primary/5'
          : 'border-border bg-surface hover:border-primary/30'
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-surface-muted text-primary border border-border">
              {getIcon()}
            </span>
            <span className="font-bold text-sm text-text">{address.label}</span>
            {address.isDefault && (
              <Badge tone="primary" size="sm" dot>
                Default Delivery
              </Badge>
            )}
          </div>
        </div>

        <p className="text-xs text-text font-medium leading-relaxed mt-2">{address.text}</p>
        <p className="text-xs text-muted mt-1">
          {address.district} &bull; PIN: <span className="font-mono">{address.pincode}</span>
        </p>
      </div>

      <div className="flex items-center justify-between gap-2 pt-4 mt-3 border-t border-border">
        {!address.isDefault ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onSetDefault(address.id)}
            loading={isSettingDefault}
            leftIcon={<CheckCircle2 className="h-3.5 w-3.5 text-muted" />}
            className="text-xs"
          >
            Make Default
          </Button>
        ) : (
          <span className="text-[11px] text-muted font-medium flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Primary Address
          </span>
        )}

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(address)}
            leftIcon={<Edit2 className="h-3.5 w-3.5" />}
            className="text-xs"
          >
            Edit
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(address.id)}
            loading={isDeleting}
            leftIcon={<Trash2 className="h-3.5 w-3.5 text-danger" />}
            className="text-xs text-danger hover:bg-danger-soft"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
