import { VIRUDHUNAGAR_TOWNS } from '@/constants/virudhunagar-towns';
import type { VendorProfile } from '../api';

export interface EditFields {
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

export type EditFormErrors = Partial<Record<keyof EditFields | 'timing', string>>;

export function mapVendorToFields(vendor: VendorProfile): EditFields {
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

export function validateEditVendor(formData: EditFields): EditFormErrors {
  const errs: EditFormErrors = {};
  if (!formData.shopName.trim()) errs.shopName = 'Shop name is required';
  if (!formData.ownerName.trim()) errs.ownerName = 'Owner name is required';
  if (!formData.phone.trim() || !/^[6-9]\d{9}$/.test(formData.phone.trim())) {
    errs.phone = 'Enter valid 10-digit mobile number';
  }
  if (!formData.fssaiNumber.trim() || !/^\d{14}$/.test(formData.fssaiNumber.trim())) {
    errs.fssaiNumber = 'Must be exactly 14 digits';
  }
  if (!formData.locality.trim()) errs.locality = 'Locality is required';
  if (!formData.pincode.trim() || !/^\d{6}$/.test(formData.pincode.trim())) {
    errs.pincode = 'Must be 6 digits';
  }
  if (!formData.line1.trim()) errs.line1 = 'Address line is required';
  if (formData.openingTime && formData.closingTime && formData.openingTime >= formData.closingTime) {
    errs.timing = 'Closing time must be after opening time';
  }
  return errs;
}
