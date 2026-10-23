import { PartialType } from '@nestjs/swagger';
import { CreateVendorProfileDto } from './create-vendor-profile.dto.js';

export class UpdateVendorProfileDto extends PartialType(CreateVendorProfileDto) {}
