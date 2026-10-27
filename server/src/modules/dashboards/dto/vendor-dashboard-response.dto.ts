import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus, SettlementStatus } from '#common/enums';
import { VendorAccessStatusDto } from '#modules/vendors';

export const STOCK_ALERT_LEVELS = ['OUT_OF_STOCK', 'NOT_STOCKED', 'LOW_STOCK'] as const;
export type StockAlertLevel = (typeof STOCK_ALERT_LEVELS)[number];

/** Orders still in progress, whatever day they were placed. */
export class VendorInProgressCountsDto {
  @ApiProperty({ example: 3, description: 'Placed, waiting for the shop to accept' })
  newOrders!: number;

  @ApiProperty({ example: 4, description: 'Accepted or being cut and packed' })
  preparing!: number;

  @ApiProperty({ example: 2, description: 'Packed, waiting for pickup' })
  ready!: number;

  @ApiProperty({ example: 1 })
  outForDelivery!: number;
}

export class VendorTodayDto {
  @ApiProperty({ example: 18, description: 'Orders placed today (IST), excluding unpaid ones' })
  orders!: number;

  @ApiProperty({ example: 11, description: 'Orders delivered today' })
  delivered!: number;

  @ApiProperty({ example: 1, description: 'Orders cancelled or rejected today' })
  cancelled!: number;

  @ApiProperty({ example: 1245000, description: "Value of today's orders in paise, excluding cancelled and rejected" })
  salesPaise!: number;
}

export class DashboardOrderPreviewDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'VNR-20261027-0042' })
  orderNumber!: string;

  @ApiProperty({ enum: OrderStatus, enumName: 'OrderStatus' })
  status!: OrderStatus;

  @ApiProperty({ example: 64000 })
  totalPaise!: number;

  @ApiProperty({ example: 1500 })
  totalWeightGrams!: number;

  @ApiProperty({ example: 2 })
  itemCount!: number;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;
}

export class StockAlertDto {
  @ApiProperty({ format: 'uuid' })
  productId!: string;

  @ApiProperty({ example: 'Goat curry cut' })
  productName!: string;

  @ApiProperty({ example: 1500, description: 'Grams left today (0 when not stocked)' })
  availableGrams!: number;

  @ApiProperty({ enum: STOCK_ALERT_LEVELS, enumName: 'StockAlertLevel' })
  level!: StockAlertLevel;
}

export class VendorStockSummaryDto {
  @ApiProperty({ example: 12, description: 'Products customers can see' })
  activeProducts!: number;

  @ApiProperty({ example: 9, description: 'Active products with opening stock recorded today' })
  stockedToday!: number;

  @ApiProperty({ example: 2 })
  lowStock!: number;

  @ApiProperty({ example: 1 })
  outOfStock!: number;

  @ApiProperty({ example: 3, description: 'Active products with no stock recorded today' })
  notStocked!: number;

  @ApiProperty({ type: [StockAlertDto], description: 'Most urgent first, at most 6' })
  alerts!: StockAlertDto[];
}

export class LastPayoutDto {
  @ApiProperty({ example: 360000 })
  netPayoutPaise!: number;

  @ApiProperty({ enum: SettlementStatus, enumName: 'SettlementStatus' })
  status!: SettlementStatus;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;
}

export class VendorPayoutSummaryDto {
  @ApiProperty({ example: 85000, description: 'Balance owed to the shop, in paise' })
  payableBalancePaise!: number;

  @ApiProperty({ example: 40500, description: 'Delivered orders not yet in a settlement, in paise' })
  pendingSettlementPaise!: number;

  @ApiProperty({ example: 364500 })
  totalSettledPayoutPaise!: number;

  @ApiPropertyOptional({ type: LastPayoutDto, nullable: true })
  lastPayout!: LastPayoutDto | null;
}

export class VendorDashboardResponseDto {
  @ApiProperty({ example: '2026-10-27', description: 'The IST day the "today" numbers cover' })
  date!: string;

  @ApiProperty({ type: VendorAccessStatusDto })
  shop!: VendorAccessStatusDto;

  @ApiProperty({ type: VendorInProgressCountsDto })
  inProgress!: VendorInProgressCountsDto;

  @ApiProperty({ type: VendorTodayDto })
  today!: VendorTodayDto;

  @ApiProperty({ type: [DashboardOrderPreviewDto], description: 'In-progress orders, oldest first, at most 5' })
  queue!: DashboardOrderPreviewDto[];

  @ApiProperty({ type: VendorStockSummaryDto })
  stock!: VendorStockSummaryDto;

  @ApiPropertyOptional({ type: VendorPayoutSummaryDto, nullable: true, description: 'Shop owners only; null for staff' })
  payouts!: VendorPayoutSummaryDto | null;
}
