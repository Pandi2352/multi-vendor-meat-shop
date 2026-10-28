import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppException, NotFoundAppException } from '#common/exceptions';
import { AddressesService } from './addresses.service.js';
import type { AddressRepository } from '../repositories/address.repository.js';

describe('AddressesService', () => {
  let service: AddressesService;
  let addressRepo: Partial<Record<keyof AddressRepository, ReturnType<typeof vi.fn>>>;

  beforeEach(() => {
    addressRepo = {
      findByUserId: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      deleteById: vi.fn(),
      updateByIdOrThrow: vi.fn(),
      clearDefaults: vi.fn(),
    };

    service = new AddressesService(addressRepo as unknown as AddressRepository);
  });

  describe('createAddress', () => {
    it('sets first address as default automatically', async () => {
      addressRepo.findByUserId!.mockResolvedValue([]);
      addressRepo.create!.mockImplementation(async (data) => ({
        _id: 'addr-1',
        ...data,
        createdAt: new Date(),
      }));

      const res = await service.createAddress('user-1', {
        label: 'HOME',
        text: '12 Gandhi Road',
        pincode: '600017',
        district: 'Chennai',
      });

      expect(res.isDefault).toBe(true);
      expect(addressRepo.clearDefaults).toHaveBeenCalledWith('user-1');
      expect(addressRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          label: 'HOME',
          pincode: '600017',
          district: 'Chennai',
          isDefault: true,
        }),
      );
    });

    it('clears defaults when saving a new default address', async () => {
      addressRepo.findByUserId!.mockResolvedValue([{ _id: 'addr-old' } as never]);
      addressRepo.create!.mockImplementation(async (data) => ({
        _id: 'addr-2',
        ...data,
        createdAt: new Date(),
      }));

      const res = await service.createAddress('user-1', {
        label: 'WORK',
        text: 'Ascendas IT Park',
        pincode: '600113',
        district: 'Chennai',
        isDefault: true,
      });

      expect(res.isDefault).toBe(true);
      expect(addressRepo.clearDefaults).toHaveBeenCalledWith('user-1');
    });
  });

  describe('deleteAddress', () => {
    it('throws forbidden if address belongs to another user', async () => {
      addressRepo.findById!.mockResolvedValue({ _id: 'addr-1', userId: 'user-other' } as never);

      await expect(service.deleteAddress('user-1', 'addr-1')).rejects.toThrow(AppException);
    });

    it('deletes own address successfully', async () => {
      addressRepo.findById!.mockResolvedValue({ _id: 'addr-1', userId: 'user-1' } as never);

      await service.deleteAddress('user-1', 'addr-1');
      expect(addressRepo.deleteById).toHaveBeenCalledWith('addr-1');
    });
  });

  describe('updateAddress', () => {
    it('updates own address and clears defaults if set as default', async () => {
      addressRepo.findById!.mockResolvedValue({ _id: 'addr-1', userId: 'user-1' } as never);
      addressRepo.updateByIdOrThrow!.mockImplementation(async (_id, patch) => ({
        _id: 'addr-1',
        userId: 'user-1',
        label: 'WORK',
        text: 'Updated office suite',
        pincode: '600001',
        district: 'Chennai',
        isDefault: true,
        createdAt: new Date(),
        ...patch,
      }));

      const res = await service.updateAddress('user-1', 'addr-1', {
        label: 'WORK',
        text: 'Updated office suite',
        isDefault: true,
      });

      expect(res.label).toBe('WORK');
      expect(addressRepo.clearDefaults).toHaveBeenCalledWith('user-1');
      expect(addressRepo.updateByIdOrThrow).toHaveBeenCalledWith(
        'addr-1',
        expect.objectContaining({ label: 'WORK', text: 'Updated office suite', isDefault: true }),
      );
    });
  });

  describe('setDefaultAddress', () => {
    it('sets specified address as default', async () => {
      addressRepo.findById!.mockResolvedValue({ _id: 'addr-1', userId: 'user-1' } as never);
      addressRepo.updateByIdOrThrow!.mockResolvedValue({
        _id: 'addr-1',
        userId: 'user-1',
        label: 'HOME',
        text: '12 Gandhi Road',
        pincode: '600017',
        district: 'Chennai',
        isDefault: true,
        createdAt: new Date(),
      } as never);

      const res = await service.setDefaultAddress('user-1', 'addr-1');
      expect(res.isDefault).toBe(true);
      expect(addressRepo.clearDefaults).toHaveBeenCalledWith('user-1');
      expect(addressRepo.updateByIdOrThrow).toHaveBeenCalledWith('addr-1', { isDefault: true });
    });
  });
});
