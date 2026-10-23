import { Injectable } from '@nestjs/common';
import { AppException, ErrorCode, NotFoundAppException } from '#common/exceptions';
import { AddressRepository } from '../repositories/address.repository.js';
import type { CreateAddressDto } from '../dto/create-address.dto.js';
import type { AddressResponseDto } from '../dto/address-response.dto.js';
import { toAddressResponseDto } from '../mappers/address.mapper.js';

@Injectable()
export class AddressesService {
  constructor(private readonly addressRepo: AddressRepository) {}

  async listAddresses(userId: string): Promise<AddressResponseDto[]> {
    const list = await this.addressRepo.findByUserId(userId);
    return list.map(toAddressResponseDto);
  }

  async createAddress(userId: string, dto: CreateAddressDto): Promise<AddressResponseDto> {
    const existing = await this.addressRepo.findByUserId(userId);
    const shouldBeDefault = Boolean(dto.isDefault) || existing.length === 0;

    if (shouldBeDefault) {
      await this.addressRepo.clearDefaults(userId);
    }

    const created = await this.addressRepo.create({
      userId,
      label: dto.label,
      text: dto.text.trim(),
      pincode: dto.pincode.trim(),
      district: dto.district.trim(),
      isDefault: shouldBeDefault,
      location: dto.lat && dto.lng ? { lat: dto.lat, lng: dto.lng } : undefined,
    });

    return toAddressResponseDto(created);
  }

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    const address = await this.addressRepo.findById(addressId);
    if (!address) {
      throw new NotFoundAppException('Address', addressId);
    }

    if (address.userId !== userId) {
      throw new AppException(ErrorCode.FORBIDDEN, {
        message: 'You can only delete your own saved addresses',
      });
    }

    await this.addressRepo.deleteById(addressId);
  }

  async setDefaultAddress(userId: string, addressId: string): Promise<AddressResponseDto> {
    const address = await this.addressRepo.findById(addressId);
    if (!address) {
      throw new NotFoundAppException('Address', addressId);
    }

    if (address.userId !== userId) {
      throw new AppException(ErrorCode.FORBIDDEN, {
        message: 'You can only update your own saved addresses',
      });
    }

    await this.addressRepo.clearDefaults(userId);
    const updated = await this.addressRepo.updateByIdOrThrow(addressId, { isDefault: true });
    return toAddressResponseDto(updated);
  }
}
