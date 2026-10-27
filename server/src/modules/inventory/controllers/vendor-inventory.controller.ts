import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SwaggerTag } from '#common/constants';
import { Role, Permission } from '#common/enums';
import {
  ApiEnvelope,
  ApiOkEnvelope,
  ApiStandardResponses,
  Auth,
  CurrentShop,
  CurrentUser,
  UuidParam,
  RequireApprovedVendor,
  Permissions,
} from '#common/decorators';
import { InventoryService } from '../services/inventory.service.js';
import { SetOpeningStockDto } from '../dto/set-opening-stock.dto.js';
import { AdjustStockDto } from '../dto/adjust-stock.dto.js';
import { InventoryBatchResponseDto } from '../dto/inventory-batch-response.dto.js';
import { InventoryMovementResponseDto } from '../dto/inventory-movement-response.dto.js';

@ApiTags(SwaggerTag.VENDOR_INVENTORY)
@Auth(Role.VENDOR_OWNER, Role.VENDOR_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
@Controller('vendor/inventory')
@RequireApprovedVendor()
export class VendorInventoryController {
  constructor(private readonly inventory: InventoryService) {}

  @Get()
  @ApiOperation({ summary: "Get current day's fresh inventory batches for all products" })
  @ApiEnvelope(InventoryBatchResponseDto, { isArray: true })
  @ApiStandardResponses()
  listTodayStock(@CurrentShop() shopId: string) {
    return this.inventory.listShopStock(shopId);
  }

  @Get(':productId')
  @ApiOperation({ summary: 'Get current stock status for a product' })
  @ApiOkEnvelope(InventoryBatchResponseDto)
  @ApiStandardResponses()
  getProductStock(@CurrentShop() shopId: string, @UuidParam('productId') productId: string) {
    return this.inventory.getTodayStock(shopId, productId);
  }

  @Post('opening')
  @Permissions(Permission.INVENTORY_MANAGE)
  @ApiOperation({
    summary: "Set or update morning opening stock for a product in today's fresh batch",
  })
  @ApiOkEnvelope(InventoryBatchResponseDto)
  @ApiStandardResponses()
  setOpeningStock(
    @CurrentShop() shopId: string,
    @CurrentUser('id') vendorUserId: string,
    @Body() dto: SetOpeningStockDto,
  ) {
    return this.inventory.setDailyOpeningStock(shopId, vendorUserId, dto);
  }

  @Post('adjust')
  @Permissions(Permission.INVENTORY_MANAGE)
  @ApiOperation({ summary: 'Record inventory adjustment (additional restock or cutting wastage)' })
  @ApiOkEnvelope(InventoryBatchResponseDto)
  @ApiStandardResponses()
  adjustStock(
    @CurrentShop() shopId: string,
    @CurrentUser('id') vendorUserId: string,
    @Body() dto: AdjustStockDto,
  ) {
    return this.inventory.adjustStock(shopId, vendorUserId, dto);
  }

  @Get(':productId/movements')
  @ApiOperation({ summary: 'Get audit movement history for a product stock' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of movements to return (default 50)',
  })
  @ApiEnvelope(InventoryMovementResponseDto, { isArray: true })
  @ApiStandardResponses()
  getMovements(
    @CurrentShop() shopId: string,
    @UuidParam('productId') productId: string,
    @Query('limit') limit?: number,
  ) {
    return this.inventory.getMovementHistory(shopId, productId, limit ? Number(limit) : 50);
  }
}
