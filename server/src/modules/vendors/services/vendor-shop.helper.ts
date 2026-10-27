import { Role, ShopStatus, UserStatus } from '#common/enums';
import { BusinessRuleException } from '#common/exceptions';
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

/** Roles whose existing account may become (or already is) a shop owner. */
const OWNER_ELIGIBLE_ROLES: readonly Role[] = [Role.CUSTOMER, Role.VENDOR_OWNER];

/**
 * Finds or creates the account for a shop owner WITHOUT changing an existing account.
 * - existing customer / shop owner → returned untouched (the owner role is applied when the
 *   invitation is accepted, or on approval);
 * - existing admin, staff or delivery account → refused, so nobody can hijack or demote it by
 *   applying with its email (the apply endpoint is public);
 * - no account → created as a pending shop owner with no password: it cannot sign in until the
 *   invitation is accepted.
 */
export async function resolveVendorOwnerUser(
  userRepo: UserRepository,
  owner: { email: string; phone: string; name?: string },
) {
  const email = owner.email.toLowerCase().trim();
  const existing = await userRepo.findByEmail(email);
  if (existing) {
    if (!OWNER_ELIGIBLE_ROLES.includes(existing.role)) {
      throw new BusinessRuleException(
        undefined,
        'This email can’t be used for a shop. Use a different email address.',
      );
    }
    return existing;
  }
  return userRepo.create({
    email,
    phone: owner.phone,
    name: owner.name,
    role: Role.VENDOR_OWNER,
    status: UserStatus.PENDING_VERIFICATION,
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
