import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SwaggerTag } from '#common/constants';
import {
  ApiEnvelope,
  ApiOkEnvelope,
  ApiStandardResponses,
  Auth,
  CurrentUser,
  UuidParam,
} from '#common/decorators';
import { AddressesService } from '../services/addresses.service.js';
import { CreateAddressDto } from '../dto/create-address.dto.js';
import { UpdateAddressDto } from '../dto/update-address.dto.js';
import { AddressResponseDto } from '../dto/address-response.dto.js';

@ApiTags(SwaggerTag.USERS)
@ApiBearerAuth()
@Auth()
@Controller('users/me/addresses')
export class AddressesController {
  constructor(private readonly addresses: AddressesService) {}

  @Get()
  @ApiOperation({ summary: 'List saved delivery addresses for authenticated customer' })
  @ApiEnvelope(AddressResponseDto, { isArray: true })
  @ApiStandardResponses()
  list(@CurrentUser('id') userId: string) {
    return this.addresses.listAddresses(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Add a new saved delivery address' })
  @ApiOkEnvelope(AddressResponseDto)
  @ApiStandardResponses()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateAddressDto) {
    return this.addresses.createAddress(userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing saved address' })
  @ApiOkEnvelope(AddressResponseDto)
  @ApiStandardResponses()
  update(
    @CurrentUser('id') userId: string,
    @UuidParam('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addresses.updateAddress(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a saved address' })
  @ApiStandardResponses()
  async delete(@CurrentUser('id') userId: string, @UuidParam('id') id: string) {
    await this.addresses.deleteAddress(userId, id);
    return { success: true };
  }

  @Patch(':id/default')
  @ApiOperation({ summary: 'Set an address as primary default' })
  @ApiOkEnvelope(AddressResponseDto)
  @ApiStandardResponses()
  setDefault(@CurrentUser('id') userId: string, @UuidParam('id') id: string) {
    return this.addresses.setDefaultAddress(userId, id);
  }
}
