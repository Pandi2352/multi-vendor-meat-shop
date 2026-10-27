import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SwaggerTag } from '#common/constants';
import { Role } from '#common/enums';
import {
  ApiCreatedEnvelope,
  ApiOkEnvelope,
  ApiStandardResponses,
  Auth,
  CurrentShop,
  CurrentUser,
  RequireApprovedVendor,
} from '#common/decorators';
import { ShopsService } from '../services/shops.service.js';
import { CreateShopDto } from '../dto/create-shop.dto.js';
import { UpdateShopDto } from '../dto/update-shop.dto.js';
import { ShopResponseDto } from '../dto/shop-response.dto.js';

@ApiTags(SwaggerTag.VENDOR_SHOP)
@Auth(Role.VENDOR_OWNER, Role.VENDOR_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
@Controller('vendor/shops')
@RequireApprovedVendor()
export class VendorShopsController {
  constructor(private readonly shops: ShopsService) {}

  @Post()
  @Auth(Role.VENDOR_OWNER, Role.CUSTOMER)
  // Shop creation has its own approval check in ShopsService.
  @RequireApprovedVendor(false)
  @ApiOperation({ summary: 'Register a new shop for the vendor' })
  @ApiCreatedEnvelope(ShopResponseDto)
  @ApiStandardResponses()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateShopDto) {
    return this.shops.createShop(userId, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current vendor shop profile' })
  @ApiOkEnvelope(ShopResponseDto)
  @ApiStandardResponses()
  getMyShop(@CurrentShop() shopId: string) {
    return this.shops.getShopForVendor(shopId);
  }

  @Patch('me')
  @Auth(Role.VENDOR_OWNER)
  @ApiOperation({ summary: 'Update shop profile, hours, delivery fee and status' })
  @ApiOkEnvelope(ShopResponseDto)
  @ApiStandardResponses()
  updateMyShop(@CurrentShop() shopId: string, @Body() dto: UpdateShopDto) {
    return this.shops.updateShop(shopId, dto);
  }
}
