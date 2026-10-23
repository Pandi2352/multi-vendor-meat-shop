import { describe, expect, it, vi } from 'vitest';
import { ShopStatus, VendorVerificationStatus } from '#common/enums';
import { AppException, ErrorCode } from '#common/exceptions';
import type { UserRepository } from '#modules/users';
import type { VendorProfileRepository } from '#modules/vendors';
import type { ShopRepository } from '../repositories/shop.repository.js';
import { ShopsService } from './shops.service.js';

describe('ShopsService', () => {
  const dummyShop = {
    _id: 'shop-uuid-1',
    vendorId: 'vendor-uuid-1',
    name: 'Murugan Fresh Meats',
    slug: 'murugan-fresh-meats',
    phone: '+919876543210',
    address: {
      line1: '12 Gandhi Rd',
      locality: 'T. Nagar',
      city: 'Chennai',
      district: 'CHENNAI',
      pincode: '600017',
    },
    location: {
      type: 'Point',
      coordinates: [80.2707, 13.0827],
    },
    status: ShopStatus.OPEN,
    openingTime: '06:00',
    closingTime: '21:00',
    serviceRadiusKm: 5,
    minOrderPaise: 0,
    deliveryFeePaise: 3000,
    images: [],
    createdAt: new Date('2026-10-23T12:00:00.000Z'),
    updatedAt: new Date('2026-10-23T12:00:00.000Z'),
  };

  it('creates shop and links shopId to user', async () => {
    const mockVendorRepo = {
      findByUserId: vi.fn().mockResolvedValue({
        _id: 'vendor-uuid-1',
        status: VendorVerificationStatus.APPROVED,
      }),
    } as unknown as VendorProfileRepository;

    const mockShopRepo = {
      findByVendorId: vi.fn().mockResolvedValue(null),
      findBySlug: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(dummyShop),
    } as unknown as ShopRepository;

    const mockUserRepo = {
      updateById: vi.fn().mockResolvedValue({}),
    } as unknown as UserRepository;

    const service = new ShopsService(mockShopRepo, mockVendorRepo, mockUserRepo);
    const result = await service.createShop('user-1', {
      name: 'Murugan Fresh Meats',
      phone: '+919876543210',
      address: {
        line1: '12 Gandhi Rd',
        locality: 'T. Nagar',
        city: 'Chennai',
        district: 'CHENNAI',
        pincode: '600017',
      },
      openingTime: '06:00',
      closingTime: '21:00',
      serviceRadiusKm: 5,
      minOrderPaise: 0,
      deliveryFeePaise: 3000,
      images: [],
    });

    expect(result.id).toBe('shop-uuid-1');
    expect(result.slug).toBe('murugan-fresh-meats');
    expect(mockUserRepo.updateById).toHaveBeenCalledWith('user-1', { shopId: 'shop-uuid-1' });
  });

  it('rejects shop creation if vendor is not approved or submitted', async () => {
    const mockVendorRepo = {
      findByUserId: vi.fn().mockResolvedValue({
        _id: 'vendor-uuid-1',
        status: VendorVerificationStatus.DRAFT,
      }),
    } as unknown as VendorProfileRepository;
    const mockShopRepo = {} as unknown as ShopRepository;
    const mockUserRepo = {} as unknown as UserRepository;

    const service = new ShopsService(mockShopRepo, mockVendorRepo, mockUserRepo);
    await expect(
      service.createShop('user-1', {
        name: 'Shop 1',
        phone: '+919876543210',
        address: {} as any,
        openingTime: '06:00',
        closingTime: '21:00',
        serviceRadiusKm: 5,
        minOrderPaise: 0,
        deliveryFeePaise: 3000,
        images: [],
      }),
    ).rejects.toThrow(AppException);
  });
});
