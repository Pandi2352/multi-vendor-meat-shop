import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { PaginationMeta } from '#common/utils';

// Swagger models for the response envelope. Runtime shaping happens in ResponseEnvelopeInterceptor.

export class PaginationMetaDto implements PaginationMeta {
  @ApiProperty({ example: 1 }) page!: number;
  @ApiProperty({ example: 20 }) limit!: number;
  @ApiProperty({ example: 45 }) total!: number;
  @ApiProperty({ example: 3 }) totalPages!: number;
  @ApiProperty({ example: true }) hasNext!: boolean;
  @ApiProperty({ example: false }) hasPrev!: boolean;
}

export class ApiSuccessResponseDto {
  @ApiProperty({ example: true })
  success!: true;
}

export class ErrorFieldDto {
  @ApiProperty({ example: 'address.pincode' }) field!: string;
  @ApiProperty({ example: ['pincode must be a 6-digit PIN code'] }) messages!: string[];
}

export class ErrorBodyDto {
  @ApiProperty({ example: 'VALIDATION_FAILED' }) code!: string;
  @ApiProperty({ example: 'Validation failed' }) message!: string;
  @ApiPropertyOptional({
    description: 'Field errors for VALIDATION_FAILED, extra context otherwise',
  })
  details?: unknown;
  @ApiProperty({ example: '0199f3c8-6a1e-7b2a-9c3d-4e5f60718293' }) requestId!: string;
  @ApiProperty({ example: '/api/v1/vendor/products' }) path!: string;
  @ApiProperty({ example: '2026-10-23T06:30:00.000Z' }) timestamp!: string;
}

export class ErrorResponseDto {
  @ApiProperty({ example: false }) success!: false;
  @ApiProperty({ type: ErrorBodyDto }) error!: ErrorBodyDto;
}
