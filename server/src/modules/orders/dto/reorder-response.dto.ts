import { ApiProperty } from '@nestjs/swagger';
import { CartResponseDto } from '#modules/cart';

export class SkippedReorderItemDto {
  @ApiProperty({ example: 'Country Chicken Curry Cut' })
  productName!: string;

  @ApiProperty({ example: 'Requested weight exceeds available fresh inventory for today' })
  reason!: string;
}

export class ReorderResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: '01925b30-3cf1-7a6b-9502-d96e47f22784' })
  shopId!: string;

  @ApiProperty({ example: 'Virudhunagar Chettinad Mutton Stall' })
  shopName!: string;

  @ApiProperty({ example: 2 })
  itemsAdded!: number;

  @ApiProperty({ type: [SkippedReorderItemDto] })
  skippedItems!: SkippedReorderItemDto[];

  @ApiProperty({ type: () => CartResponseDto })
  cart!: CartResponseDto;
}
