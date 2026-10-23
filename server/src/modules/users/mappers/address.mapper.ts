import type { Address } from '../schemas/address.schema.js';
import type { AddressResponseDto } from '../dto/address-response.dto.js';

export const toAddressResponseDto = (a: Address): AddressResponseDto => ({
  id: a._id,
  userId: a.userId,
  label: a.label,
  text: a.text,
  pincode: a.pincode,
  district: a.district,
  isDefault: Boolean(a.isDefault),
  location: a.location ? { lat: a.location.lat, lng: a.location.lng } : undefined,
  createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : new Date().toISOString(),
});
