import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class UpdateVendorPermissionsDto {
  @ApiProperty({
    type: [String],
    example: ['broiler-chicken', 'goat-mutton', 'nattu-kozhi'],
    description: 'Allowed category slugs this vendor is authorized to butcher and sell',
  })
  @IsArray()
  @IsString({ each: true })
  allowedCategories!: string[];
}
