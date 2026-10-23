import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { AddressDto, ListQueryDto } from '#common/dto';
import { AppException, ErrorCode } from '#common/exceptions';
import { IsIndianPhone, IsGrams } from '#common/validators';
import { NormalizePhone } from '#common/transformers';
import { createValidationPipe } from './create-validation-pipe.js';

class SampleDto {
  @NormalizePhone()
  @IsIndianPhone()
  phone!: string;

  @IsGrams({ step: 250 })
  grams!: number;

  @ValidateNested()
  @Type(() => AddressDto)
  address!: AddressDto;
}

const pipe = createValidationPipe();
const validate = (metatype: new () => object, value: unknown, type: 'body' | 'query' = 'body') =>
  pipe.transform(value, { type, metatype });

const validAddress = {
  line1: '12, Gandhi Street',
  locality: 'T. Nagar',
  city: 'Chennai',
  district: 'CHENNAI',
  pincode: '600017',
};

describe('global validation pipe', () => {
  it('transforms and accepts valid input', async () => {
    const result = (await validate(SampleDto, {
      phone: '98765 43210',
      grams: 750,
      address: validAddress,
    })) as SampleDto;
    expect(result.phone).toBe('+919876543210');
    expect(result).toBeInstanceOf(SampleDto);
  });

  it('applies list query defaults and converts query strings', async () => {
    const result = (await validate(ListQueryDto, { page: '2' }, 'query')) as ListQueryDto;
    expect(result).toMatchObject({ page: 2, limit: 20 });
  });

  it('returns flattened field errors with VALIDATION_FAILED', async () => {
    const error = await validate(SampleDto, {
      phone: '12345',
      grams: 600,
      address: { ...validAddress, pincode: '0123', district: 'MUMBAI' },
      extra: true,
    }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(AppException);
    const appError = error as AppException;
    expect(appError.code).toBe(ErrorCode.VALIDATION_FAILED);
    const fields = (appError.details as { field: string }[]).map((d) => d.field);
    expect(fields).toEqual(
      expect.arrayContaining(['phone', 'grams', 'address.pincode', 'address.district', 'extra']),
    );
  });
});
