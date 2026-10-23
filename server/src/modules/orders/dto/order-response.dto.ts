import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CutType, OrderStatus, PaymentMethod, PaymentStatus, PreparationOption, Role } from '#common/enums';
import { OrderDeliveryAddressDto, OrderSlotDto } from './create-order.dto.js';

export class OrderItemResponseDto {
  @ApiProperty({ format: 'uuid' })
  productId!: string;

  @ApiProperty({ example: 'Country Chicken Curry Cut' })
  name!: string;

  @ApiProperty({ example: 500 })
  grams!: number;

  @ApiProperty({ example: 1 })
  quantity!: number;

  @ApiPropertyOptional({ enum: CutType })
  cutType?: CutType;

  @ApiPropertyOptional({ enum: PreparationOption })
  preparation?: PreparationOption;

  @ApiProperty({ example: 38000, description: 'Price per kg in paise' })
  pricePerKgPaise!: number;

  @ApiProperty({ example: 19000, description: 'Line total in paise' })
  lineTotalPaise!: number;

  @ApiPropertyOptional({ example: 515, description: 'Actual weight in grams packed by vendor' })
  actualPackedGrams?: number;

  @ApiPropertyOptional({ example: 'Medium curry pieces' })
  notes?: string;
}

export class OrderTotalsResponseDto {
  @ApiProperty({ example: 38000 })
  subtotalPaise!: number;

  @ApiProperty({ example: 3000 })
  deliveryFeePaise!: number;

  @ApiProperty({ example: 1500 })
  packagingFeePaise!: number;

  @ApiProperty({ example: 0 })
  discountPaise!: number;

  @ApiProperty({ example: 42500 })
  totalPaise!: number;

  @ApiProperty({ example: 1000 })
  totalWeightGrams!: number;
}

export class OrderPaymentResponseDto {
  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.COD })
  method!: PaymentMethod;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.COD_PENDING })
  status!: PaymentStatus;

  @ApiPropertyOptional({ example: 'pay_123456' })
  providerRef?: string;

  @ApiPropertyOptional({ example: '2026-10-23T10:00:00.000Z' })
  paidAt?: string;
}

export class OrderEventResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  orderId!: string;

  @ApiProperty({ enum: OrderStatus })
  fromStatus!: OrderStatus;

  @ApiProperty({ enum: OrderStatus })
  toStatus!: OrderStatus;

  @ApiProperty({ format: 'uuid' })
  actorId!: string;

  @ApiProperty({ enum: Role })
  actorRole!: Role;

  @ApiPropertyOptional({ example: 'Customer cancelled before acceptance' })
  reason?: string;

  @ApiProperty({ example: '2026-10-23T10:00:00.000Z' })
  createdAt!: string;
}

export class OrderResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'TN-20261023-0001' })
  orderNumber!: string;

  @ApiProperty({ format: 'uuid' })
  customerId!: string;

  @ApiProperty({ format: 'uuid' })
  shopId!: string;

  @ApiPropertyOptional({ example: 'Murugan Fresh Mutton & Chicken' })
  shopName?: string;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items!: OrderItemResponseDto[];

  @ApiProperty({ type: OrderTotalsResponseDto })
  totals!: OrderTotalsResponseDto;

  @ApiProperty({ type: OrderDeliveryAddressDto })
  deliveryAddress!: OrderDeliveryAddressDto;

  @ApiPropertyOptional({ example: 'Please ring bell' })
  customerNotes?: string;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PLACED })
  status!: OrderStatus;

  @ApiProperty({ type: OrderPaymentResponseDto })
  payment!: OrderPaymentResponseDto;

  @ApiPropertyOptional({ type: OrderSlotDto })
  slot?: OrderSlotDto;

  @ApiPropertyOptional({ example: 'Customer cancelled' })
  cancelReason?: string;

  @ApiPropertyOptional({ example: 'Out of stock for day' })
  rejectReason?: string;

  @ApiPropertyOptional({ type: [OrderEventResponseDto] })
  timeline?: OrderEventResponseDto[];

  @ApiProperty({ example: '2026-10-23T10:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-10-23T10:05:00.000Z' })
  updatedAt!: string;
}
