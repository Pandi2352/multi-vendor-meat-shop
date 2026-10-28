export interface VendorFormData {
  shopName: string;
  shopNameTa: string;
  ownerName: string;
  phone: string;
  email: string;
  town: string;
  locality: string;
  pincode: string;
  line1: string;
  fssaiNumber: string;
  openingTime: string;
  closingTime: string;
}

export type VendorFormErrors = Partial<Record<keyof VendorFormData | 'timing', string>>;

/** Validates add vendor form fields and returns per-field error messages. */
export function validateVendorForm(data: VendorFormData): VendorFormErrors {
  const errors: VendorFormErrors = {};

  if (!data.shopName.trim()) {
    errors.shopName = 'Shop name in English is required';
  } else if (data.shopName.trim().length < 3) {
    errors.shopName = 'Shop name must be at least 3 characters';
  }

  if (!data.ownerName.trim()) {
    errors.ownerName = 'Owner name is required';
  } else if (data.ownerName.trim().length < 2) {
    errors.ownerName = 'Owner name must be at least 2 characters';
  }

  if (!data.phone.trim()) {
    errors.phone = 'Mobile number is required';
  } else if (!/^[6-9]\d{9}$/.test(data.phone.trim())) {
    errors.phone = 'Enter valid 10-digit mobile number (e.g. 9842012345)';
  }

  if (!data.email.trim()) {
    errors.email = 'Owner email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = 'Enter a valid email address';
  }

  if (!data.town.trim()) {
    errors.town = 'Please select a town';
  }

  if (!data.locality.trim()) {
    errors.locality = 'Locality / area name is required';
  }

  if (!data.pincode.trim()) {
    errors.pincode = 'Pincode is required';
  } else if (!/^\d{6}$/.test(data.pincode.trim())) {
    errors.pincode = 'Pincode must be exactly 6 digits';
  }

  if (!data.line1.trim()) {
    errors.line1 = 'Door number and street address are required';
  }

  if (!data.fssaiNumber.trim()) {
    errors.fssaiNumber = 'FSSAI registration number is required';
  } else if (!/^\d{14}$/.test(data.fssaiNumber.trim())) {
    errors.fssaiNumber = 'FSSAI number must be exactly 14 digits';
  }

  if (data.openingTime && data.closingTime && data.openingTime >= data.closingTime) {
    errors.timing = 'Closing time must be after opening time';
  }

  return errors;
}
