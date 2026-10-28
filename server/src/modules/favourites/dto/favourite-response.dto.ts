import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ToggleFavouriteResponseDto {
  @ApiProperty({ example: true })
  isFavourited!: boolean;

  @ApiProperty({ example: '01925b30-3cf1-7a6b-9502-d96e47f22784' })
  productId!: string;
}

export class FavouriteItemResponseDto {
  @ApiProperty({ example: '01925b30-3cf1-7a6b-9502-d96e47f22784' })
  id!: string;

  @ApiProperty({ example: '01925b30-3cf1-7a6b-9502-d96e47f22784' })
  productId!: string;

  @ApiProperty({ example: 'Chettinad Country Chicken (Nattu Kozhi)' })
  productName!: string;

  @ApiPropertyOptional({ example: 'Nattu Kozhi (Country Chicken)' })
  categoryName?: string;

  @ApiProperty({ example: '01925b30-3cf1-7a6b-9502-d96e47f22784' })
  shopId!: string;

  @ApiProperty({ example: 'Virudhunagar Chettinad Mutton Stall' })
  shopName!: string;

  @ApiProperty({ example: 48000, description: 'Price per kg in integer paise' })
  pricePerKgPaise!: number;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781' })
  imageUrl?: string;

  @ApiProperty({ example: 500 })
  minGrams!: number;

  @ApiProperty({ example: 2000 })
  maxGrams!: number;

  @ApiProperty({ example: 250 })
  stepGrams!: number;

  @ApiProperty({ example: true })
  isAvailable!: boolean;

  @ApiProperty({ example: 15000, description: 'Live available daily stock in grams' })
  availableGrams!: number;

  @ApiProperty({ example: '2026-10-28T08:00:00.000Z' })
  createdAt!: Date;
}
