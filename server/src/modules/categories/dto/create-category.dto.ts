import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, Length, Min } from 'class-validator';
import { ToBoolean, ToInt, Trim } from '#common/transformers';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Country Chicken' })
  @Trim()
  @IsString()
  @Length(2, 60)
  name!: string;

  @ApiPropertyOptional({ example: 'country-chicken' })
  @IsOptional()
  @Trim()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: 'Naturally raised free-range country chicken' })
  @IsOptional()
  @Trim()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://images.example.com/categories/country-chicken.jpg' })
  @IsOptional()
  @Trim()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Parent category UUID if subcategory' })
  @IsOptional()
  @IsUUID('7')
  parentId?: string | null;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @ToInt()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  isActive?: boolean;
}
