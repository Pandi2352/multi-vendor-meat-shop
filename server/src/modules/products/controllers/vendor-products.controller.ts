import { Body, Controller, Delete, Get, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SwaggerTag } from '#common/constants';
import { Role } from '#common/enums';
import {
  ApiCreatedEnvelope,
  ApiOkEnvelope,
  ApiPaginatedResponse,
  ApiStandardResponses,
  Auth,
  CurrentShop,
  UuidParam,
  RequireApprovedVendor,
} from '#common/decorators';
import { ProductsService } from '../services/products.service.js';
import { CreateProductDto } from '../dto/create-product.dto.js';
import { UpdateProductDto } from '../dto/update-product.dto.js';
import { QueryProductsDto } from '../dto/query-products.dto.js';
import { ProductResponseDto } from '../dto/product-response.dto.js';

@ApiTags(SwaggerTag.VENDOR_PRODUCTS)
@Auth(Role.VENDOR_OWNER, Role.VENDOR_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
@Controller('vendor/products')
@RequireApprovedVendor()
export class VendorProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List products in current vendor shop (paginated)' })
  @ApiPaginatedResponse(ProductResponseDto)
  @ApiStandardResponses()
  list(@CurrentShop() shopId: string, @Query() query: QueryProductsDto) {
    return this.products.listForVendor(shopId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product details in vendor shop' })
  @ApiOkEnvelope(ProductResponseDto)
  @ApiStandardResponses()
  getById(@CurrentShop() shopId: string, @UuidParam('id') id: string) {
    return this.products.getForVendor(shopId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Add a new product to vendor shop catalogue' })
  @ApiCreatedEnvelope(ProductResponseDto)
  @ApiStandardResponses()
  create(@CurrentShop() shopId: string, @Body() dto: CreateProductDto) {
    return this.products.createForVendor(shopId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product details, pricing, cuts or status' })
  @ApiOkEnvelope(ProductResponseDto)
  @ApiStandardResponses()
  update(
    @CurrentShop() shopId: string,
    @UuidParam('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.products.updateForVendor(shopId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive a product from vendor catalogue' })
  @ApiOkEnvelope(ProductResponseDto)
  @ApiStandardResponses()
  archive(@CurrentShop() shopId: string, @UuidParam('id') id: string) {
    return this.products.archiveForVendor(shopId, id);
  }
}
