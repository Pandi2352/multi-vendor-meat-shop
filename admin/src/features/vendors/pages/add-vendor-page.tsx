import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Store, AlertCircle, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { VIRUDHUNAGAR_TOWNS } from '@/constants/virudhunagar-towns';
import { useCreateVendor, type VendorProfile } from '../api';
import {
  validateVendorForm,
  type VendorFormData,
  type VendorFormErrors,
} from '../components/add-vendor-form.validation';
import { VendorFormIdentityCard } from '../components/vendor-form-identity-card';
import { VendorFormPremisesCard } from '../components/vendor-form-premises-card';
import { VendorFormCredentialsScheduleCard } from '../components/vendor-form-credentials-schedule-card';
import { VendorCreatedPanel } from '../components/vendor-created-panel';

const INITIAL_FORM: VendorFormData = {
  ownerName: '',
  shopName: '',
  shopNameTa: '',
  phone: '',
  email: '',
  town: VIRUDHUNAGAR_TOWNS[0].nameEn,
  locality: '',
  line1: '',
  pincode: VIRUDHUNAGAR_TOWNS[0].pincode,
  fssaiNumber: '',
  municipalPermitNumber: '',
  openingTime: '06:00',
  closingTime: '21:00',
};

/** Full page for adding a new certified butcher stall with dense, zero-empty-space layout. */
export function AddVendorPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<VendorFormData>(INITIAL_FORM);
  const [serviceRadiusKm, setServiceRadiusKm] = useState<number>(8);
  const [errors, setErrors] = useState<VendorFormErrors>({});
  const [createdVendor, setCreatedVendor] = useState<VendorProfile | null>(null);

  const createMutation = useCreateVendor();

  const updateField = (key: keyof VendorFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key] || (key.includes('Time') && errors.timing)) {
      setErrors((prev) => ({ ...prev, [key]: undefined, timing: undefined }));
    }
  };

  const handleTownChange = (selectedTown: string) => {
    const townData = VIRUDHUNAGAR_TOWNS.find((t) => t.nameEn === selectedTown);
    setFormData((prev) => ({
      ...prev,
      town: selectedTown,
      pincode: townData ? townData.pincode : prev.pincode,
    }));
    if (errors.town || errors.pincode) {
      setErrors((prev) => ({ ...prev, town: undefined, pincode: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateVendorForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const townData = VIRUDHUNAGAR_TOWNS.find((t) => t.nameEn === formData.town);
    createMutation.mutate(
      {
        ownerName: formData.ownerName.trim(),
        shopName: formData.shopName.trim(),
        shopNameTa: formData.shopNameTa.trim() || undefined,
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        fssaiNumber: formData.fssaiNumber.trim(),
        municipalPermitNumber: formData.municipalPermitNumber?.trim() || undefined,
        openingTime: formData.openingTime,
        closingTime: formData.closingTime,
        serviceRadiusKm,
        address: {
          line1: formData.line1.trim(),
          locality: formData.locality.trim() || formData.town,
          city: formData.town,
          district: 'Virudhunagar',
          pincode: formData.pincode.trim(),
          location: townData ? { lat: townData.lat, lng: townData.lng } : undefined,
        },
      },
      {
        onSuccess: (vendor) => {
          setCreatedVendor(vendor);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
      },
    );
  };

  if (createdVendor) {
    return (
      <div className="w-full py-4 space-y-5">
        <VendorCreatedPanel
          vendor={createdVendor}
          onReset={() => {
            setCreatedVendor(null);
            setFormData(INITIAL_FORM);
          }}
        />
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" size="md" onClick={() => navigate(ROUTES.ADMIN_VENDORS)}>
            Back to All Stalls
          </Button>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setCreatedVendor(null);
              setFormData(INITIAL_FORM);
            }}
          >
            Add Another Butcher Stall
          </Button>
        </div>
      </div>
    );
  }

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
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-text flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              Add New Butcher Stall / புதிய கடை பதிவு
            </h1>
            <p className="text-xs text-muted mt-0.5">
              Register stall identity, assign doorstep coverage, and automatically dispatch login credentials to the owner.
            </p>
          </div>
        </div>
      </div>

      {createMutation.isError && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Failed to create butcher stall. Please check the provided details and try again.</span>
        </div>
      )}

      {/* Dense Form Layout Filling Full Width */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Card 1: 4 columns across 1 row on desktop */}
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
          serviceRadiusKm={serviceRadiusKm}
          errorTown={errors.town}
          errorLocality={errors.locality}
          errorPincode={errors.pincode}
          errorLine1={errors.line1}
          onTownChange={handleTownChange}
          onChange={(k, v) => {
            if (k === 'serviceRadiusKm') setServiceRadiusKm(v as number);
            else updateField(k, v as string);
          }}
        />

        {/* Card 3: 3 columns in Row 1 + 3 columns in Row 2 */}
        <VendorFormCredentialsScheduleCard
          ownerName={formData.ownerName}
          phone={formData.phone}
          email={formData.email}
          openingTime={formData.openingTime}
          closingTime={formData.closingTime}
          errorOwnerName={errors.ownerName}
          errorPhone={errors.phone}
          errorEmail={errors.email}
          errorTiming={errors.timing}
          onChange={(k, v) => updateField(k, v)}
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
            loading={createMutation.isPending}
            leftIcon={<Check className="h-4 w-4" />}
          >
            Add Stall & Dispatch Credentials
          </Button>
        </div>
      </form>
    </div>
  );
}
