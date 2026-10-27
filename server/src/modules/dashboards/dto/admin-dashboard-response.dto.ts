import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminVendorCountsDto {
  @ApiProperty({ example: 4, description: 'Applications submitted or under review' })
  awaitingReview!: number;

  @ApiProperty({ example: 1 })
  resubmissionRequired!: number;

  @ApiProperty({ example: 42 })
  approved!: number;

  @ApiProperty({ example: 2 })
  suspended!: number;
}

export class AdminShopCountsDto {
  @ApiProperty({ example: 37, description: 'Shops taking orders right now' })
  open!: number;

  @ApiProperty({ example: 44 })
  total!: number;
}

export class AdminOrderCountsDto {
  @ApiProperty({ example: 212, description: 'Orders placed today (IST), excluding unpaid ones' })
  today!: number;

  @ApiProperty({ example: 31, description: 'Placed, accepted, being prepared, ready or out for delivery' })
  inProgress!: number;

  @ApiProperty({ example: 6, description: 'Placed and not yet accepted by the shop' })
  awaitingAcceptance!: number;
}

export class AdminDeliveryCountsDto {
  @ApiProperty({ example: 3, description: 'Delivery tasks with no partner yet' })
  unassigned!: number;

  @ApiProperty({ example: 18, description: 'Assigned, picked up or on the way' })
  inTransit!: number;
}

export class AdminMoneySummaryDto {
  @ApiProperty({ example: 14285000, description: "Value of today's orders in paise, excluding cancelled and rejected" })
  salesTodayPaise!: number;

  @ApiProperty({ example: 2450000, description: 'Owed to shops for delivered orders not yet settled, in paise' })
  pendingPayoutsPaise!: number;
}

export class AdminDashboardResponseDto {
  @ApiProperty({ example: '2026-10-27' })
  date!: string;

  @ApiProperty({ type: AdminVendorCountsDto })
  vendors!: AdminVendorCountsDto;

  @ApiProperty({ type: AdminShopCountsDto })
  shops!: AdminShopCountsDto;

  @ApiProperty({ type: AdminOrderCountsDto })
  orders!: AdminOrderCountsDto;

  @ApiProperty({ type: AdminDeliveryCountsDto })
  delivery!: AdminDeliveryCountsDto;

  @ApiProperty({ example: 2, description: 'Disputes open or under review' })
  openDisputes!: number;

  @ApiPropertyOptional({ type: AdminMoneySummaryDto, nullable: true, description: 'Admins and finance only; null for other roles' })
  money!: AdminMoneySummaryDto | null;
}
