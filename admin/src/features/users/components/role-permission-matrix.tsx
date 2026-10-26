import { useState, useEffect } from 'react';
import { Shield, Check, Save } from 'lucide-react';
import { Button } from '@/components/ui';
import {
  useRolesWithPermissions,
  useUpdateRolePermissions,
  type RoleDetail,
  type UserRole,
} from '../api';

const PERMISSION_GROUPS: { name: string; permissions: { key: string; label: string }[] }[] = [
  {
    name: 'Users & Security',
    permissions: [
      { key: 'user.read', label: 'View users & addresses' },
      { key: 'user.manage', label: 'Manage roles, status & invitations' },
    ],
  },
  {
    name: 'Butcher Stalls & Vendors',
    permissions: [
      { key: 'vendor.read', label: 'View vendor applications' },
      { key: 'vendor.verify', label: 'Approve / reject butcher stalls' },
      { key: 'shop.manage', label: 'Modify stall settings & opening hours' },
    ],
  },
  {
    name: 'Products & Inventory',
    permissions: [
      { key: 'category.manage', label: 'Manage meat categories' },
      { key: 'product.manage', label: 'Create & edit cuts and prices' },
      { key: 'product.moderate', label: 'Moderate stall products' },
      { key: 'inventory.manage', label: 'Record opening stock & wastage' },
    ],
  },
  {
    name: 'Orders & Delivery',
    permissions: [
      { key: 'order.read', label: 'View live marketplace orders' },
      { key: 'order.fulfil', label: 'Prepare, pack and hand over orders' },
      { key: 'order.manage', label: 'Cancel orders & override status' },
      { key: 'delivery-task.manage', label: 'Assign delivery tasks & drop-off OTP' },
    ],
  },
  {
    name: 'Finance & Settlements',
    permissions: [
      { key: 'refund.approve', label: 'Approve customer refunds' },
      { key: 'commission.manage', label: 'Set platform commission rates' },
      { key: 'settlement.read', label: 'View stall ledger & payouts' },
      { key: 'settlement.manage', label: 'Execute bank payouts & settlements' },
    ],
  },
  {
    name: 'Governance & Analytics',
    permissions: [
      { key: 'promotion.manage', label: 'Create discount coupons' },
      { key: 'ticket.manage', label: 'Handle dispute tickets' },
      { key: 'analytics.read', label: 'View sales & GMV reports' },
      { key: 'config.manage', label: 'Update platform parameters' },
      { key: 'audit.read', label: 'View audit logs' },
    ],
  },
];

export function RolePermissionMatrix() {
  const { data: roles = [], isLoading } = useRolesWithPermissions();
  const [selectedRole, setSelectedRole] = useState<UserRole>('OPERATIONS');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const updateMutation = useUpdateRolePermissions();

  const currentRoleDetail = roles.find((r: RoleDetail) => r.role === selectedRole);

  useEffect(() => {
    if (currentRoleDetail) {
      setSelectedPermissions(currentRoleDetail.permissions);
    }
  }, [currentRoleDetail]);

  const togglePermission = (permKey: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permKey) ? prev.filter((p) => p !== permKey) : [...prev, permKey]
    );
  };

  const handleSave = () => {
    updateMutation.mutate({
      role: selectedRole,
      permissions: selectedPermissions,
    });
  };

  if (isLoading) {
    return <div className="p-8 text-center text-xs text-muted">Loading role permissions matrix...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="border border-border rounded-md bg-surface p-3 space-y-1.5 md:col-span-1">
        <h3 className="text-xs font-semibold text-text mb-2 px-1">Select Role:</h3>
        {roles.map((r: RoleDetail) => (
          <button
            key={r.role}
            onClick={() => setSelectedRole(r.role)}
            className={`w-full text-left p-2 rounded-md text-xs font-medium transition-colors flex items-center justify-between ${
              selectedRole === r.role
                ? 'bg-primary text-primary-foreground'
                : 'text-text hover:bg-surface-muted'
            }`}
          >
            <div>
              <p>{r.name}</p>
              <p className={`text-[10px] ${selectedRole === r.role ? 'text-primary-foreground/80' : 'text-muted'}`}>
                {r.userCount} users
              </p>
            </div>
            {selectedRole === r.role && <Check className="h-3.5 w-3.5 shrink-0" />}
          </button>
        ))}
      </div>

      <div className="border border-border rounded-md bg-surface p-4 md:col-span-3 space-y-4 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
          <div>
            <h3 className="text-sm font-semibold text-text flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-primary" />
              {currentRoleDetail?.name} Permissions
            </h3>
            <p className="text-xs text-muted mt-0.5">{currentRoleDetail?.description}</p>
          </div>
          {!currentRoleDetail?.isSystem && (
            <Button
              variant="primary"
              size="sm"
              loading={updateMutation.isPending}
              leftIcon={<Save className="h-3.5 w-3.5" />}
              onClick={handleSave}
            >
              Save Permissions
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PERMISSION_GROUPS.map((grp) => (
            <div key={grp.name} className="p-3 rounded-md bg-surface-muted/50 border border-border space-y-2">
              <h4 className="font-semibold text-text text-xs border-b border-border pb-1">{grp.name}</h4>
              <div className="space-y-1.5">
                {grp.permissions.map((p) => {
                  const isChecked = selectedPermissions.includes(p.key);
                  return (
                    <label
                      key={p.key}
                      className="flex items-start gap-2 cursor-pointer text-text text-xs hover:text-primary transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={currentRoleDetail?.isSystem}
                        onChange={() => togglePermission(p.key)}
                        className="rounded-md border-border text-primary focus:ring-0 mt-0.5"
                      />
                      <span>
                        <span className="block font-medium">{p.label}</span>
                        <span className="block text-[10px] font-mono text-muted">{p.key}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
