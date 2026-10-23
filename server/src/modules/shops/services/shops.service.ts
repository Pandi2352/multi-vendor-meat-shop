import { Injectable } from '@nestjs/common';
import { AppException, ConflictAppException, ErrorCode, NotFoundAppException } from '#common/exceptions';
import { ShopStatus, VendorVerificationStatus } from '#common/enums';
import { slugify } from '#common/utils';
import type { PaginatedResult } from '#common/dto';
import { UserRepository } from '#modules/users';
import { VendorProfileRepository } from '#modules/vendors';
import { ShopRepository } from '../repositories/shop.repository.js';
import type { CreateShopDto } from '../dto/create-shop.dto.js';
import type { UpdateShopDto } from '../dto/update-shop.dto.js';
import type { QueryShopsDto } from '../dto/query-shops.dto.js';
import type { ShopResponseDto } from '../dto/shop-response.dto.js';
import { toShopResponseDto } from '../mappers/shop.mapper.js';

@Injectable()
export class ShopsService {
  constructor(
    private readonly shopRepo: ShopRepository,
    private readonly vendorRepo: VendorProfileRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async createShop(vendorUserId: string, dto: CreateShopDto): Promise<ShopResponseDto> {
    const vendor = await this.vendorRepo.findByUserId(vendorUserId);
    if (!vendor) {
      throw new AppException(ErrorCode.VENDOR_NOT_APPROVED, {
        message: 'Vendor profile must be created before setting up a shop',
      });
    }

    if (
      vendor.status !== VendorVerificationStatus.APPROVED &&
      vendor.status !== VendorVerificationStatus.SUBMITTED
    ) {
      throw new AppException(ErrorCode.VENDOR_NOT_APPROVED, {
        message: 'Vendor verification must be submitted or approved',
      });
    }

    const existingShop = await this.shopRepo.findByVendorId(vendor._id);
    if (existingShop) {
      throw new ConflictAppException('Vendor already has a registered shop');
    }

    let slug = slugify(dto.name);
    const slugExists = await this.shopRepo.findBySlug(slug);
    if (slugExists) {
      slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
    }

    const lng = dto.address.location?.lng ?? 80.2707;
    const lat = dto.address.location?.lat ?? 13.0827;

    const shop = await this.shopRepo.create({
      vendorId: vendor._id,
      name: dto.name,
      slug,
      description: dto.description,
      phone: dto.phone,
      address: {
        line1: dto.address.line1,
        line2: dto.address.line2,
        locality: dto.address.locality,
        city: dto.address.city,
        district: dto.address.district,
        pincode: dto.address.pincode,
      },
      location: {
        type: 'Point',
        coordinates: [lng, lat],
      },
      status: ShopStatus.OPEN,
      openingTime: dto.openingTime ?? '06:00',
      closingTime: dto.closingTime ?? '21:00',
      serviceRadiusKm: dto.serviceRadiusKm ?? 5,
      minOrderPaise: dto.minOrderPaise ?? 0,
      deliveryFeePaise: dto.deliveryFeePaise ?? 3000,
      freeDeliveryAbovePaise: dto.freeDeliveryAbovePaise,
      images: dto.images ?? [],
      deletedAt: null,
      deletedBy: null,
    });

    await this.userRepo.updateById(vendorUserId, { shopId: shop._id });

    return toShopResponseDto(shop);
  }

  async getShopById(id: string): Promise<ShopResponseDto> {
    const shop = await this.shopRepo.findByIdOrThrow(id);
    return toShopResponseDto(shop);
  }

  async getShopBySlug(slug: string): Promise<ShopResponseDto> {
    const shop = await this.shopRepo.findBySlug(slug);
    if (!shop) throw new NotFoundAppException('Shop', slug);
    return toShopResponseDto(shop);
  }

  async getShopForVendor(shopId: string): Promise<ShopResponseDto> {
    const shop = await this.shopRepo.findByIdOrThrow(shopId);
    return toShopResponseDto(shop);
  }

  async updateShop(shopId: string, dto: UpdateShopDto): Promise<ShopResponseDto> {
    const shop = await this.shopRepo.findByIdOrThrow(shopId);

    const updateData: Record<string, unknown> = {};
    if (dto.name) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.phone) updateData.phone = dto.phone;
    if (dto.status) updateData.status = dto.status;
    if (dto.openingTime) updateData.openingTime = dto.openingTime;
    if (dto.closingTime) updateData.closingTime = dto.closingTime;
    if (dto.serviceRadiusKm) updateData.serviceRadiusKm = dto.serviceRadiusKm;
    if (dto.minOrderPaise !== undefined) updateData.minOrderPaise = dto.minOrderPaise;
    if (dto.deliveryFeePaise !== undefined) updateData.deliveryFeePaise = dto.deliveryFeePaise;
    if (dto.freeDeliveryAbovePaise !== undefined)
      updateData.freeDeliveryAbovePaise = dto.freeDeliveryAbovePaise;
    if (dto.images) updateData.images = dto.images;

    if (dto.address) {
      updateData.address = {
        line1: dto.address.line1,
        line2: dto.address.line2,
        locality: dto.address.locality,
        city: dto.address.city,
        district: dto.address.district,
        pincode: dto.address.pincode,
      };
      if (dto.address.location) {
        updateData.location = {
          type: 'Point',
          coordinates: [dto.address.location.lng, dto.address.location.lat],
        };
      }
    }

    const updated = await this.shopRepo.updateByIdOrThrow(shop._id, updateData);
    return toShopResponseDto(updated);
  }

  async listShops(query: QueryShopsDto): Promise<PaginatedResult<ShopResponseDto>> {
    const filter: Record<string, unknown> = {};
    if (query.district) filter['address.district'] = query.district;
    if (query.status) filter.status = query.status;

    const result = await this.shopRepo.paginate(filter, query, {
      sortable: ['name', 'createdAt', 'status'],
      searchable: ['name', 'address.locality', 'address.city'],
      defaultSort: '-createdAt',
    });

    return result.map(toShopResponseDto);
  }

  async listNearby(lng: number, lat: number, radiusKm = 10): Promise<ShopResponseDto[]> {
    const shops = await this.shopRepo.findNearby(lng, lat, radiusKm);
    return shops.map(toShopResponseDto);
  }
}
