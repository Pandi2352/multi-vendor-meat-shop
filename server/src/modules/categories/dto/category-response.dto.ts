import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ example: '0199f3c8-6a1e-7b2a-9c3d-4e5f60718293' })
  id!: string;

  @ApiProperty({ example: 'Country Chicken' })
  name!: string;

  @ApiProperty({ example: 'country-chicken' })
  slug!: string;

  @ApiPropertyOptional({ example: 'Naturally raised free-range country chicken' })
  description?: string;

  @ApiPropertyOptional({ example: 'https://images.example.com/categories/country-chicken.jpg' })
  imageUrl?: string;

  @ApiPropertyOptional({ example: null, nullable: true })
  parentId!: string | null;

  @ApiProperty({ example: 0 })
  order!: number;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiPropertyOptional({ type: () => [CategoryResponseDto] })
  children?: CategoryResponseDto[];

  @ApiProperty({ example: '2026-10-23T06:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-10-23T06:00:00.000Z' })
  updatedAt!: string;
}
