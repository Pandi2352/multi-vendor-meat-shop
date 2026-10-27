import { useState } from 'react';
import { Store, Clock, MapPin, Phone, Truck, Pencil, Users, Beef } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { canAccessPath } from '@/config/route-access';
import { ROUTES } from '@/config/routes';
import { useCurrentUser, useHasPermission } from '@/features/auth';
import { formatINR } from '@/utils/format';
import { useVendorShop, useUpdateVendorShop, type UpdateShopPayload } from '../api';
import { EditShopModal } from '../components/edit-shop-modal';
import { ShopSwitcher } from '../components/shop-switcher';

export function VendorShopProfilePage() {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const role = useCurrentUser()?.role;
  const canEdit = useHasPermission('shop.manage');
  const canOpenTeam = !!role && canAccessPath(role, ROUTES.VENDOR_STAFF);
  const { data: shop, isLoading } = useVendorShop();
  const updateMutation = useUpdateVendorShop();

  const handleEditSubmit = (payload: UpdateShopPayload) => {
    updateMutation.mutate(payload, {
      onSuccess: () => setIsEditOpen(false),
    });
  };

  if (isLoading) {
    return <div className="p-8 text-center text-xs text-muted">Loading stall profile...</div>;
  }

  if (!shop) {
    return (
      <div className="p-8 text-center rounded-md border border-border bg-surface space-y-3">
        <Store className="h-10 w-10 text-muted mx-auto" />
        <p className="text-sm font-semibold text-text">No Stall Found</p>
        <p className="text-xs text-muted">
          Please switch to an active stall above to view profile details.
        </p>
        <div className="pt-2">
          <ShopSwitcher />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-text">Butcher Stall Profile & Operations</h1>
          </div>
          <p className="text-xs text-muted mt-1">
            Operating schedule, delivery zone radius, contact info, and stall status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ShopSwitcher />
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="gap-1.5"
            >
              <Pencil className="h-3.5 w-3.5 text-primary" />
              <span>Edit Stall</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Stall Profile Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Stall Identity & Address */}
        <div className="p-5 rounded-md border border-border bg-surface space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                Butcher Stall
              </span>
              <h2 className="text-lg font-bold text-text mt-0.5">{shop.name}</h2>
              {shop.description && <p className="text-muted text-xs mt-1">{shop.description}</p>}
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                shop.status === 'OPEN'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {shop.status === 'OPEN' ? 'Open for Orders' : shop.status}
            </span>
          </div>

          <div className="p-3 rounded-md bg-surface-muted border border-border space-y-2 text-muted">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-text font-medium">
                  {shop.address.line1}
                  {shop.address.line2 ? `, ${shop.address.line2}` : ''}
                </p>
                <p>
                  {shop.address.locality}, {shop.address.city}, {shop.address.district} -{' '}
                  {shop.address.pincode}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-border">
              <Phone className="h-4 w-4 text-primary shrink-0" />
              <span className="text-text font-medium">{shop.phone}</span>
            </div>
          </div>
        </div>

        {/* Operating Hours & Delivery */}
        <div className="p-5 rounded-md border border-border bg-surface space-y-4">
          <h3 className="text-sm font-semibold text-text">Daily Butchering & Delivery Specs</h3>
          <div className="space-y-3">
            <div className="p-3 rounded-md bg-surface-muted border border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-600" />
                <span className="font-medium text-text">Daily Operating Hours</span>
              </div>
              <span className="font-bold text-text">
                {shop.openingTime} - {shop.closingTime}
              </span>
            </div>

            <div className="p-3 rounded-md bg-surface-muted border border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                <span className="font-medium text-text">Delivery Radius</span>
              </div>
              <span className="font-bold text-text">{shop.serviceRadiusKm} km coverage</span>
            </div>

            <div className="p-3 rounded-md bg-surface-muted border border-border flex items-center justify-between">
              <span className="font-medium text-text">Base Delivery Fee</span>
              <span className="font-bold text-text">{formatINR(shop.deliveryFeePaise)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <Link
          to={ROUTES.VENDOR_PRODUCTS}
          className="p-4 rounded-md border border-border bg-surface hover:border-primary/50 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-primary/10 text-primary">
              <Beef className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-text">Daily Meat Cuts Catalogue</h4>
              <p className="text-muted text-[11px]">
                Manage per-kg rates, cuts, and butchery prep options
              </p>
            </div>
          </div>
          <span className="text-primary font-medium">Manage Cuts →</span>
        </Link>

        {canOpenTeam && (
          <Link
            to={ROUTES.VENDOR_STAFF}
            className="p-4 rounded-md border border-border bg-surface hover:border-primary/50 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-text">Stall Staff & Cutter Team</h4>
                <p className="text-muted text-[11px]">
                  Authorize cutters, billing staff, and packaging handlers
                </p>
              </div>
            </div>
            <span className="text-primary font-medium">Manage Team →</span>
          </Link>
        )}
      </div>

      <EditShopModal
        shop={shop}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEditSubmit}
        isSubmitting={updateMutation.isPending}
      />
    </div>
  );
}
