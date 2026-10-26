import { Role, ShopStatus, UserStatus } from '#common/enums';
import { slugify } from '#common/utils';
import { UserRepository } from '#modules/users';
import { ShopRepository } from '../../shops/repositories/shop.repository.js';
import { getVirudhunagarCoords } from '../constants/town-coords.constants.js';

interface BuildShopParams {
  shopRepo: ShopRepository;
  vendorId: string;
  name: string;
  phone: string;
  address: {
    line1: string;
    line2?: string;
    locality: string;
    city: string;
    district?: string;
    pincode: string;
    location?: { lat: number; lng: number };
  };
  openingTime?: string;
  closingTime?: string;
  serviceRadiusKm?: number;
  status?: ShopStatus;
}

export async function findOrCreateVendorUser(
  userRepo: UserRepository,
  email: string,
  phone: string,
  name?: string,
) {
  const existing = await userRepo.findByEmail(email);
  if (existing) {
    if (existing.role !== Role.VENDOR_OWNER) {
      await userRepo.updateById(existing._id, { role: Role.VENDOR_OWNER });
    }
    return existing;
  }
  return userRepo.create({
    email,
    phone,
    name,
    role: Role.VENDOR_OWNER,
    status: UserStatus.ACTIVE,
    shopId: null,
    deletedAt: null,
    deletedBy: null,
  });
}

export async function createVendorShop(params: BuildShopParams) {
  const {
    shopRepo,
    vendorId,
    name,
    phone,
    address,
    openingTime = '06:00',
    closingTime = '21:00',
    serviceRadiusKm = 10,
    status = ShopStatus.OPEN,
  } = params;

  let slug = slugify(name);
  if (await shopRepo.findBySlug(slug)) {
    slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  }

  const coords = address.location || getVirudhunagarCoords(address.city || address.locality);

  return shopRepo.create({
    vendorId,
    name,
    slug,
    phone,
    address: {
      line1: address.line1,
      line2: address.line2,
      locality: address.locality,
      city: address.city,
      district: address.district || 'Virudhunagar',
      pincode: address.pincode,
    },
    location: {
      type: 'Point',
      coordinates: [coords.lng, coords.lat],
    },
    status,
    openingTime,
    closingTime,
    serviceRadiusKm,
    minOrderPaise: 0,
    deliveryFeePaise: 3000,
    images: [],
    deletedAt: null,
    deletedBy: null,
  });
}
