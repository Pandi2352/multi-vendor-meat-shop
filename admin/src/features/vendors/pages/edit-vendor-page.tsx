import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Store, AlertCircle, Check } from 'lucide-react';
import { Button, LoaderState } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { VIRUDHUNAGAR_TOWNS } from '@/constants/virudhunagar-towns';
import { useVendorDetails, useUpdateVendor } from '../api';
import { VendorStatusBadge } from '../components/vendor-status-badge';
import { VendorFormIdentityCard } from '../components/vendor-form-identity-card';
import { VendorFormPremisesCard } from '../components/vendor-form-premises-card';
import { VendorFormCredentialsScheduleCard } from '../components/vendor-form-credentials-schedule-card';
import {
  type EditFields,
  type EditFormErrors,
  mapVendorToFields,
  validateEditVendor,
} from './edit-vendor-page.types';

/** Full page for editing existing butcher stall operational details. */
export function EditVendorPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: vendor, isLoading, isError } = useVendorDetails(id);
  const updateMutation = useUpdateVendor();

  const [formData, setFormData] = useState<EditFields | null>(null);
  const [errors, setErrors] = useState<EditFormErrors>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (vendor) {
      setFormData(mapVendorToFields(vendor));
    }
  }, [vendor]);

  if (isLoading) {
    return (
      <div className="py-12">
        <LoaderState title="Loading stall details..." description="Fetching profile & statutory documents..." />
      </div>
    );
  }

  if (isError || !vendor || !formData) {
    return (
      <div className="w-full py-12 text-center space-y-4">
        <Store className="h-10 w-10 text-muted mx-auto" />
        <h2 className="text-base font-semibold text-text">Butcher Stall Not Found</h2>
        <p className="text-xs text-muted">The requested stall does not exist or has been removed.</p>
        <Link to={ROUTES.ADMIN_VENDORS}>
          <Button variant="outline" size="sm">
            Back to All Stalls
          </Button>
        </Link>
      </div>
    );
  }

  const updateField = (key: keyof EditFields, value: string | number) => {
    setFormData((prev) => (prev ? { ...prev, [key]: value } : prev));
    if (errors[key] || (key.includes('Time') && errors.timing)) {
      setErrors((prev) => ({ ...prev, [key]: undefined, timing: undefined }));
    }
  };

  const handleTownChange = (selectedTown: string) => {
    const townData = VIRUDHUNAGAR_TOWNS.find((t) => t.nameEn === selectedTown);
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            town: selectedTown,
            pincode: townData ? townData.pincode : prev.pincode,
          }
        : prev,
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateEditVendor(formData);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    updateMutation.mutate(
      {
        id: vendor.id,
        data: {
          shopName: formData.shopName.trim(),
          shopNameTa: formData.shopNameTa.trim() || undefined,
          ownerName: formData.ownerName.trim(),
          phone: formData.phone.trim(),
          fssaiNumber: formData.fssaiNumber.trim(),
          municipalPermitNumber: formData.municipalPermitNumber.trim() || undefined,
          city: formData.town,
          locality: formData.locality.trim(),
          pincode: formData.pincode.trim(),
          line1: formData.line1.trim(),
          openingTime: formData.openingTime,
          closingTime: formData.closingTime,
          serviceRadiusKm: formData.serviceRadiusKm,
        },
      },
      {
        onSuccess: () => {
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
        },
      },
    );
  };

  return (
    <div className="w-full space-y-4 pb-8">
      {/* Header Bar */}
      <div className="space-y-1 pb-3 border-b border-border">
        <Link
          to={ROUTES.ADMIN_VENDORS}
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-text transition-colors font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Butcher Stalls</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-text flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              Edit Butcher Stall: {vendor.businessName}
            </h1>
            <p className="text-xs text-muted mt-0.5">
              Update butchery operations, FSSAI registration details, and delivery coverage parameters.
            </p>
          </div>
          <VendorStatusBadge status={vendor.status} />
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs flex items-center gap-2 font-medium">
          <Check className="h-4 w-4 shrink-0" />
          <span>Stall details and operating schedule updated successfully!</span>
        </div>
      )}

      {updateMutation.isError && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Failed to save stall changes. Please check details and try again.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Card 1: 4 columns across 1 row */}
        <VendorFormIdentityCard
          shopName={formData.shopName}
          shopNameTa={formData.shopNameTa}
          fssaiNumber={formData.fssaiNumber}
          municipalPermitNumber={formData.municipalPermitNumber}
          errorShopName={errors.shopName}
          errorFssai={errors.fssaiNumber}
          onChange={(k, v) => updateField(k, v)}
        />

        {/* Card 2: 4 columns in Row 1 + Full width Address in Row 2 */}
        <VendorFormPremisesCard
          town={formData.town}
          locality={formData.locality}
          pincode={formData.pincode}
          line1={formData.line1}
          serviceRadiusKm={formData.serviceRadiusKm}
          errorTown={errors.town}
          errorLocality={errors.locality}
          errorPincode={errors.pincode}
          errorLine1={errors.line1}
          onTownChange={handleTownChange}
          onChange={(k, v) => updateField(k, v)}
        />

        {/* Card 3: 3 columns in Row 1 + 3 columns in Row 2 */}
        <VendorFormCredentialsScheduleCard
          ownerName={formData.ownerName}
          phone={formData.phone}
          email={vendor.invitation?.email || 'Registered Vendor Account'}
          openingTime={formData.openingTime}
          closingTime={formData.closingTime}
          isEdit={true}
          errorOwnerName={errors.ownerName}
          errorPhone={errors.phone}
          errorTiming={errors.timing}
          onChange={(k, v) => {
            if (k !== 'email') updateField(k, v);
          }}
        />

        {/* Sticky Action Bar */}
        <div className="p-3.5 rounded-md bg-surface border border-border flex items-center justify-between gap-4 sticky bottom-4 z-20">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => navigate(ROUTES.ADMIN_VENDORS)}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={updateMutation.isPending}
            leftIcon={<Check className="h-4 w-4" />}
          >
            Save Stall Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
