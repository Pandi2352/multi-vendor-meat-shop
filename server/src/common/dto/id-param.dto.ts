import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class IdParamDto {
  @ApiProperty({ format: 'uuid', example: '0199f3c8-6a1e-7b2a-9c3d-4e5f60718293' })
  @IsUUID('7')
  id!: string;
}
