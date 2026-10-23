import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InventoryService } from './inventory.service.js';
import type { InventoryBatchRepository } from '../repositories/inventory-batch.repository.js';
import type { InventoryMovementRepository } from '../repositories/inventory-movement.repository.js';
import type { ProductsService } from '#modules/products';
import { AppException, ErrorCode } from '#common/exceptions';

describe('InventoryService', () => {
  let service: InventoryService;
  let mockBatchRepo: Record<string, ReturnType<typeof vi.fn>>;
  let mockMovementRepo: Record<string, ReturnType<typeof vi.fn>>;
  let mockProductsService: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(() => {
    mockBatchRepo = {
      findByShopProductDate: vi.fn(),
      findBatchesForDate: vi.fn(),
      create: vi.fn(),
      updateByIdOrThrow: vi.fn(),
      atomicReserve: vi.fn(),
      atomicRelease: vi.fn(),
      atomicCommit: vi.fn(),
      atomicAdjustAvailable: vi.fn(),
    };

    mockMovementRepo = {
      create: vi.fn(),
      findProductMovements: vi.fn(),
    };

    mockProductsService = {
      getForVendor: vi.fn(),
    };

    service = new InventoryService(
      mockBatchRepo as unknown as InventoryBatchRepository,
      mockMovementRepo as unknown as InventoryMovementRepository,
      mockProductsService as unknown as ProductsService,
    );
  });

  it('sets opening stock and records OPENING movement', async () => {
    mockProductsService.getForVendor.mockResolvedValue({ id: 'prod-1' });
    mockBatchRepo.findByShopProductDate.mockResolvedValue(null);

    const createdBatch = {
      _id: 'batch-1',
      shopId: 'shop-1',
      productId: 'prod-1',
      batchDate: '2026-10-23',
      availableGrams: 20000,
      reservedGrams: 0,
      totalOpeningGrams: 20000,
      expiresAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockBatchRepo.create.mockResolvedValue(createdBatch);
    mockMovementRepo.create.mockResolvedValue({});

    const result = await service.setDailyOpeningStock('shop-1', 'user-1', {
      productId: 'prod-1',
      openingGrams: 20000,
      notes: 'Morning batch',
    });

    expect(result.availableGrams).toBe(20000);
    expect(result.status).toBe('IN_STOCK');
    expect(mockMovementRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'OPENING',
        grams: 20000,
      }),
    );
  });

  it('reserves stock atomically and records RESERVED movement', async () => {
    const updatedBatch = {
      _id: 'batch-1',
      shopId: 'shop-1',
      productId: 'prod-1',
      batchDate: '2026-10-23',
      availableGrams: 19000,
      reservedGrams: 1000,
      totalOpeningGrams: 20000,
      expiresAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockBatchRepo.atomicReserve.mockResolvedValue(updatedBatch);
    mockMovementRepo.create.mockResolvedValue({});

    const result = await service.reserveStock('shop-1', 'prod-1', 1000, 'order-1', 'cust-1');
    expect(result.availableGrams).toBe(19000);
    expect(result.reservedGrams).toBe(1000);
    expect(mockMovementRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'RESERVED',
        grams: 1000,
      }),
    );
  });

  it('throws AppException OUT_OF_STOCK when atomic reservation fails', async () => {
    mockBatchRepo.atomicReserve.mockResolvedValue(null);

    await expect(
      service.reserveStock('shop-1', 'prod-1', 50000, 'order-1', 'cust-1'),
    ).rejects.toThrow(
      expect.objectContaining({
        code: ErrorCode.OUT_OF_STOCK,
      }),
    );
  });
});
