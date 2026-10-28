import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';
import { Trim } from '#common/transformers';

export class CreateReviewDto {
  @ApiProperty({ description: 'Star rating from 1 to 5', minimum: 1, maximum: 5, example: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional({
    description: 'Customer review comment about meat freshness and stall service',
    example: 'Fresh mutton curry cuts, perfect marbling and cleanly packed in chiller bag!',
  })
  @IsOptional()
  @Trim()
  @IsString()
  @Length(2, 500)
  comment?: string;
}
