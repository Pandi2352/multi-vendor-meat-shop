import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button, FormField, Input } from '@/components/ui';
import { VIRUDHUNAGAR_TOWNS } from '@/constants/virudhunagar-towns';
import { useCreateVendor, type VendorProfile } from '../api';
import {
  validateVendorForm,
  type VendorFormData,
  type VendorFormErrors,
} from './add-vendor-form.validation';
import { AddVendorLocationFields } from './add-vendor-location-fields';

interface AddVendorFormProps {
  onCreated: (vendor: VendorProfile) => void;
  onCancel: () => void;
}

/** Form with per-field validation errors for adding an approved butcher stall. */
export function AddVendorForm({ onCreated, onCancel }: AddVendorFormProps) {
  const [formData, setFormData] = useState<VendorFormData>({
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
    openingTime: '06:00',
    closingTime: '21:00',
  });
  const [errors, setErrors] = useState<VendorFormErrors>({});

  const createMutation = useCreateVendor();

  const updateField = (key: keyof VendorFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key] || (key.includes('Time') && errors.timing)) {
      setErrors((prev) => ({ ...prev, [key]: undefined, timing: undefined }));
    }
  };

  const handleTownChange = (selectedTownName: string) => {
    const townData = VIRUDHUNAGAR_TOWNS.find((t) => t.nameEn === selectedTownName);
    setFormData((prev) => ({
      ...prev,
      town: selectedTownName,
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
        openingTime: formData.openingTime,
        closingTime: formData.closingTime,
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
        onSuccess: (vendor) => onCreated(vendor),
      },
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="px-6 py-5 md:px-8 space-y-4 overflow-y-auto text-xs sm:text-sm"
    >
      {createMutation.isError && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Failed to add stall. Check phone or FSSAI number.</span>
        </div>
      )}

      {/* Shop Names: English + Tamil */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField htmlFor="shop-name-en" label="Shop Name (English) *" error={errors.shopName}>
          <Input
            id="shop-name-en"
            value={formData.shopName}
            onChange={(e) => updateField('shopName', e.target.value)}
            invalid={!!errors.shopName}
            placeholder="e.g. Sivakasi Broiler Centre"
          />
        </FormField>
        <FormField
          htmlFor="shop-name-ta"
          label="Shop Name in Tamil / கடையின் பெயர் (தமிழ்)"
          error={errors.shopNameTa}
        >
          <Input
            id="shop-name-ta"
            value={formData.shopNameTa}
            onChange={(e) => updateField('shopNameTa', e.target.value)}
            placeholder="எ.கா. சிவகாசி பிராய்லர் சென்டர்"
          />
        </FormField>
      </div>

      {/* Owner & Contact */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField htmlFor="owner-name" label="Owner Name *" error={errors.ownerName}>
          <Input
            id="owner-name"
            value={formData.ownerName}
            onChange={(e) => updateField('ownerName', e.target.value)}
            invalid={!!errors.ownerName}
            placeholder="e.g. M. Ramasamy"
          />
        </FormField>
        <FormField htmlFor="owner-phone" label="Mobile (10 Digits) *" error={errors.phone}>
          <Input
            id="owner-phone"
            type="tel"
            maxLength={10}
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, ''))}
            invalid={!!errors.phone}
            placeholder="9842012345"
          />
        </FormField>
        <FormField htmlFor="owner-email" label="Owner Email *" error={errors.email}>
          <Input
            id="owner-email"
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            invalid={!!errors.email}
            placeholder="stall@example.com"
          />
        </FormField>
      </div>

      {/* Location & Address fields */}
      <AddVendorLocationFields
        formData={formData}
        errors={errors}
        onTownChange={handleTownChange}
        onUpdate={updateField}
      />

      {/* Operating Hours */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField htmlFor="opening-time" label="Opens At">
          <Input
            id="opening-time"
            type="time"
            value={formData.openingTime}
            onChange={(e) => updateField('openingTime', e.target.value)}
          />
        </FormField>
        <FormField htmlFor="closing-time" label="Closes At" error={errors.timing}>
          <Input
            id="closing-time"
            type="time"
            value={formData.closingTime}
            onChange={(e) => updateField('closingTime', e.target.value)}
            invalid={!!errors.timing}
          />
        </FormField>
      </div>

      {/* Actions */}
      <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="sm" loading={createMutation.isPending}>
          Add Stall & Activate
        </Button>
      </div>
    </form>
  );
}
