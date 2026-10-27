import { Injectable } from '@nestjs/common';
import { AppException, ErrorCode, NotFoundAppException } from '#common/exceptions';
import { endOfDayIST, nowIST, todayIST } from '#common/utils';
import { InventoryMovementType } from '#common/enums';
import { ProductsService } from '#modules/products';
import { InventoryBatchRepository } from '../repositories/inventory-batch.repository.js';
import { InventoryMovementRepository } from '../repositories/inventory-movement.repository.js';
import { SetOpeningStockDto } from '../dto/set-opening-stock.dto.js';
import { AdjustStockDto } from '../dto/adjust-stock.dto.js';
import { InventoryBatchResponseDto } from '../dto/inventory-batch-response.dto.js';
import { InventoryMovementResponseDto } from '../dto/inventory-movement-response.dto.js';
import {
  toInventoryBatchResponseDto,
  toInventoryMovementResponseDto,
} from '../mappers/inventory.mapper.js';

@Injectable()
export class InventoryService {
  constructor(
    private readonly batchRepo: InventoryBatchRepository,
    private readonly movementRepo: InventoryMovementRepository,
    private readonly products: ProductsService,
  ) {}

  async setDailyOpeningStock(
    shopId: string,
    actorId: string,
    dto: SetOpeningStockDto,
  ): Promise<InventoryBatchResponseDto> {
    await this.products.getForVendor(shopId, dto.productId);

    const batchDate = dto.batchDate || todayIST();
    const expiresAt = endOfDayIST(nowIST());

    const existing = await this.batchRepo.findByShopProductDate(shopId, dto.productId, batchDate);
    let batch;

    if (existing) {
      const delta = dto.openingGrams - existing.totalOpeningGrams;
      batch = await this.batchRepo.updateByIdOrThrow(existing._id, {
        totalOpeningGrams: dto.openingGrams,
        availableGrams: Math.max(0, existing.availableGrams + delta),
      });
    } else {
      batch = await this.batchRepo.create({
        shopId,
        productId: dto.productId,
        batchDate,
        totalOpeningGrams: dto.openingGrams,
        availableGrams: dto.openingGrams,
        reservedGrams: 0,
        expiresAt,
      });
    }

    await this.movementRepo.create({
      shopId,
      productId: dto.productId,
      type: InventoryMovementType.OPENING,
      grams: dto.openingGrams,
      availableGramsAfter: batch.availableGrams,
      reservedGramsAfter: batch.reservedGrams,
      referenceType: 'OPENING',
      referenceId: null,
      actorId,
      notes: dto.notes,
    });

    return toInventoryBatchResponseDto(batch);
  }

  async adjustStock(
    shopId: string,
    actorId: string,
    dto: AdjustStockDto,
  ): Promise<InventoryBatchResponseDto> {
    await this.products.getForVendor(shopId, dto.productId);
    const today = todayIST();

    const isReduction = dto.type === InventoryMovementType.WASTAGE;
    const deltaGrams = isReduction ? -Math.abs(dto.grams) : Math.abs(dto.grams);

    const updated = await this.batchRepo.atomicAdjustAvailable(
      shopId,
      dto.productId,
      today,
      deltaGrams,
    );

    if (!updated) {
      throw new AppException(ErrorCode.OUT_OF_STOCK, {
        message: 'Cannot adjust stock: insufficient available fresh stock',
      });
    }

    await this.movementRepo.create({
      shopId,
      productId: dto.productId,
      type: dto.type,
      grams: deltaGrams,
      availableGramsAfter: updated.availableGrams,
      reservedGramsAfter: updated.reservedGrams,
      referenceType: dto.type,
      referenceId: null,
      actorId,
      notes: dto.notes,
    });

    return toInventoryBatchResponseDto(updated);
  }

  async reserveStock(
    shopId: string,
    productId: string,
    grams: number,
    referenceId: string | null,
    actorId: string,
  ): Promise<InventoryBatchResponseDto> {
    const today = todayIST();
    const updated = await this.batchRepo.atomicReserve(shopId, productId, today, grams);

    if (!updated) {
      throw new AppException(ErrorCode.OUT_OF_STOCK, {
        message: 'Item is out of stock or requested weight exceeds available fresh inventory',
        details: { productId, requestedGrams: grams },
      });
    }

    await this.movementRepo.create({
      shopId,
      productId,
      type: InventoryMovementType.RESERVED,
      grams,
      availableGramsAfter: updated.availableGrams,
      reservedGramsAfter: updated.reservedGrams,
      referenceType: 'RESERVE',
      referenceId,
      actorId,
    });

    return toInventoryBatchResponseDto(updated);
  }

  async releaseStock(
    shopId: string,
    productId: string,
    grams: number,
    referenceId: string | null,
    actorId: string,
  ): Promise<InventoryBatchResponseDto> {
    const today = todayIST();
    const updated = await this.batchRepo.atomicRelease(shopId, productId, today, grams);

    if (updated) {
      await this.movementRepo.create({
        shopId,
        productId,
        type: InventoryMovementType.RELEASED,
        grams,
        availableGramsAfter: updated.availableGrams,
        reservedGramsAfter: updated.reservedGrams,
        referenceType: 'RELEASE',
        referenceId,
        actorId,
      });
      return toInventoryBatchResponseDto(updated);
    }

    const current = await this.batchRepo.findByShopProductDate(shopId, productId, today);
    if (!current) throw new NotFoundAppException('InventoryBatch', productId);
    return toInventoryBatchResponseDto(current);
  }

  async commitStock(
    shopId: string,
    productId: string,
    grams: number,
    referenceId: string,
    actorId: string,
  ): Promise<InventoryBatchResponseDto> {
    const today = todayIST();
    const updated = await this.batchRepo.atomicCommit(shopId, productId, today, grams);

    if (!updated) {
      throw new AppException(ErrorCode.INTERNAL_ERROR, {
        message: 'Failed to commit inventory deduction for order',
      });
    }

    await this.movementRepo.create({
      shopId,
      productId,
      type: InventoryMovementType.SOLD,
      grams,
      availableGramsAfter: updated.availableGrams,
      reservedGramsAfter: updated.reservedGrams,
      referenceType: 'ORDER',
      referenceId,
      actorId,
    });

    return toInventoryBatchResponseDto(updated);
  }

  async getTodayStock(shopId: string, productId: string): Promise<InventoryBatchResponseDto> {
    const today = todayIST();
    const batch = await this.batchRepo.findByShopProductDate(shopId, productId, today);

    if (!batch) {
      return {
        id: '',
        shopId,
        productId,
        batchDate: today,
        availableGrams: 0,
        reservedGrams: 0,
        totalOpeningGrams: 0,
        expiresAt: endOfDayIST(nowIST()).toISOString(),
        status: 'OUT_OF_STOCK',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    return toInventoryBatchResponseDto(batch);
  }

  async listShopStock(shopId: string): Promise<InventoryBatchResponseDto[]> {
    const today = todayIST();
    const batches = await this.batchRepo.findBatchesForDate(shopId, today);
    return batches.map((b) => toInventoryBatchResponseDto(b));
  }

  async getMovementHistory(
    shopId: string,
    productId: string,
    limit = 50,
  ): Promise<InventoryMovementResponseDto[]> {
    const movements = await this.movementRepo.findProductMovements(shopId, productId, limit);
    return movements.map((m) => toInventoryMovementResponseDto(m));
  }
}
