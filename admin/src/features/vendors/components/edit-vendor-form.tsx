import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button, FormField, Input } from '@/components/ui';
import { VIRUDHUNAGAR_TOWNS } from '@/constants/virudhunagar-towns';
import { useUpdateVendor, type VendorProfile } from '../api';
import { EditVendorLocationFields } from './edit-vendor-location-fields';

interface EditVendorFormProps {
  vendor: VendorProfile;
  onSaved: (updated: VendorProfile) => void;
  onCancel: () => void;
}

interface EditFormData {
  ownerName: string;
  shopName: string;
  shopNameTa: string;
  phone: string;
  fssaiNumber: string;
  municipalPermitNumber: string;
  town: string;
  locality: string;
  line1: string;
  pincode: string;
  openingTime: string;
  closingTime: string;
  serviceRadiusKm: number;
}

type EditFormErrors = Partial<Record<keyof EditFormData | 'timing', string>>;

function initFormData(vendor: VendorProfile): EditFormData {
  const shop = vendor.shop;
  return {
    ownerName: vendor.ownerName || '',
    shopName: vendor.businessName || '',
    shopNameTa: shop?.nameTa || '',
    phone: shop?.phone || '',
    fssaiNumber: vendor.fssaiNumber || '',
    municipalPermitNumber: vendor.municipalPermitNumber || '',
    town: shop?.city || VIRUDHUNAGAR_TOWNS[0].nameEn,
    locality: shop?.locality || '',
    line1: shop?.line1 || '',
    pincode: shop?.pincode || VIRUDHUNAGAR_TOWNS[0].pincode,
    openingTime: shop?.openingTime || '06:00',
    closingTime: shop?.closingTime || '21:00',
    serviceRadiusKm: shop?.serviceRadiusKm || 8,
  };
}

/** Form for editing existing stall details, premises and operating hours. */
export function EditVendorForm({ vendor, onSaved, onCancel }: EditVendorFormProps) {
  const [formData, setFormData] = useState<EditFormData>(() => initFormData(vendor));
  const [errors, setErrors] = useState<EditFormErrors>({});

  const updateMutation = useUpdateVendor();

  useEffect(() => {
    setFormData(initFormData(vendor));
  }, [vendor]);

  const updateField = (key: keyof EditFormData, value: string | number) => {
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

  const validate = (): boolean => {
    const errs: EditFormErrors = {};
    if (!formData.shopName.trim()) errs.shopName = 'Shop name in English is required';
    if (!formData.ownerName.trim()) errs.ownerName = 'Owner name is required';
    if (!formData.phone.trim()) {
      errs.phone = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      errs.phone = 'Enter a valid 10-digit mobile number';
    }
    if (!formData.fssaiNumber.trim()) {
      errs.fssaiNumber = 'FSSAI number is required';
    } else if (!/^\d{14}$/.test(formData.fssaiNumber.trim())) {
      errs.fssaiNumber = 'Must be exactly 14 digits';
    }
    if (!formData.town.trim()) errs.town = 'Please select a town';
    if (!formData.locality.trim()) errs.locality = 'Locality is required';
    if (!formData.pincode.trim()) {
      errs.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      errs.pincode = 'Must be 6 digits';
    }
    if (!formData.line1.trim()) errs.line1 = 'Street address is required';
    if (formData.openingTime && formData.closingTime && formData.openingTime >= formData.closingTime) {
      errs.timing = 'Closing time must be after opening time';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    updateMutation.mutate(
      {
        id: vendor.id,
        data: {
          ownerName: formData.ownerName.trim(),
          shopName: formData.shopName.trim(),
          shopNameTa: formData.shopNameTa.trim() || undefined,
          phone: formData.phone.trim(),
          fssaiNumber: formData.fssaiNumber.trim(),
          municipalPermitNumber: formData.municipalPermitNumber.trim() || undefined,
          line1: formData.line1.trim(),
          locality: formData.locality.trim(),
          city: formData.town.trim(),
          pincode: formData.pincode.trim(),
          openingTime: formData.openingTime,
          closingTime: formData.closingTime,
          serviceRadiusKm: Number(formData.serviceRadiusKm) || 8,
        },
      },
      {
        onSuccess: (updated) => onSaved(updated),
      },
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="px-6 py-5 md:px-8 space-y-4 overflow-y-auto text-xs sm:text-sm"
    >
      {updateMutation.isError && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Failed to update stall details. Please check values.</span>
        </div>
      )}

      {/* Shop Names: English + Tamil */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField htmlFor="edit-shop-name-en" label="Shop Name (English) *" error={errors.shopName}>
          <Input
            id="edit-shop-name-en"
            value={formData.shopName}
            onChange={(e) => updateField('shopName', e.target.value)}
            invalid={!!errors.shopName}
            placeholder="e.g. Sivakasi Broiler Centre"
          />
        </FormField>
        <FormField
          htmlFor="edit-shop-name-ta"
          label="Shop Name in Tamil / கடையின் பெயர் (தமிழ்)"
        >
          <Input
            id="edit-shop-name-ta"
            value={formData.shopNameTa}
            onChange={(e) => updateField('shopNameTa', e.target.value)}
            placeholder="எ.கா. சிவகாசி பிராய்லர் சென்டர்"
          />
        </FormField>
      </div>

      {/* Owner & Phone & FSSAI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField htmlFor="edit-owner-name" label="Owner Name *" error={errors.ownerName}>
          <Input
            id="edit-owner-name"
            value={formData.ownerName}
            onChange={(e) => updateField('ownerName', e.target.value)}
            invalid={!!errors.ownerName}
          />
        </FormField>
        <FormField htmlFor="edit-owner-phone" label="Mobile (10 Digits) *" error={errors.phone}>
          <Input
            id="edit-owner-phone"
            type="tel"
            maxLength={10}
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, ''))}
            invalid={!!errors.phone}
          />
        </FormField>
        <FormField htmlFor="edit-fssai" label="FSSAI Number (14 Digits) *" error={errors.fssaiNumber}>
          <Input
            id="edit-fssai"
            maxLength={14}
            value={formData.fssaiNumber}
            onChange={(e) => updateField('fssaiNumber', e.target.value.replace(/\D/g, ''))}
            invalid={!!errors.fssaiNumber}
          />
        </FormField>
      </div>

      {/* Location, Address, Hours and Radius */}
      <EditVendorLocationFields
        town={formData.town}
        locality={formData.locality}
        pincode={formData.pincode}
        line1={formData.line1}
        municipalPermitNumber={formData.municipalPermitNumber}
        openingTime={formData.openingTime}
        closingTime={formData.closingTime}
        serviceRadiusKm={formData.serviceRadiusKm}
        errors={errors}
        onTownChange={handleTownChange}
        onUpdate={(key, val) => updateField(key as keyof EditFormData, val)}
      />

      {/* Actions */}
      <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="sm" loading={updateMutation.isPending}>
          Save Stall Changes
        </Button>
      </div>
    </form>
  );
}
