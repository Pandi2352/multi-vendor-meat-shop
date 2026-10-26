import type { TnDistrictCode } from '#common/constants';
import type { Shop } from '../schemas/shop.schema.js';
import type { ShopResponseDto } from '../dto/shop-response.dto.js';

export const toShopResponseDto = (shop: Shop): ShopResponseDto => ({
  id: shop._id,
  vendorId: shop.vendorId,
  name: shop.name,
  slug: shop.slug,
  description: shop.description,
  phone: shop.phone,
  address: {
    line1: shop.address.line1,
    line2: shop.address.line2,
    locality: shop.address.locality,
    city: shop.address.city,
    district: shop.address.district as TnDistrictCode,
    pincode: shop.address.pincode,
    location: shop.location?.coordinates
      ? {
          lat: shop.location.coordinates[1],
          lng: shop.location.coordinates[0],
        }
      : undefined,
  },
  status: shop.status,
  openingTime: shop.openingTime,
  closingTime: shop.closingTime,
  serviceRadiusKm: shop.serviceRadiusKm,
  minOrderPaise: shop.minOrderPaise,
  deliveryFeePaise: shop.deliveryFeePaise,
  freeDeliveryAbovePaise: shop.freeDeliveryAbovePaise,
  images: shop.images ?? [],
  distanceMeters:
    typeof (shop as { distanceMeters?: number }).distanceMeters === 'number'
      ? Math.round((shop as { distanceMeters?: number }).distanceMeters!)
      : undefined,
  createdAt:
    shop.createdAt instanceof Date ? shop.createdAt.toISOString() : String(shop.createdAt),
  updatedAt:
    shop.updatedAt instanceof Date ? shop.updatedAt.toISOString() : String(shop.updatedAt),
});
