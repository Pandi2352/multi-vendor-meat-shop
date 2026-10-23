import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SwaggerTag } from '#common/constants';
import { ApiEnvelope, ApiOkEnvelope, ApiStandardResponses, Public, UuidParam } from '#common/decorators';
import { ProductsService } from '../services/products.service.js';
import { ProductResponseDto } from '../dto/product-response.dto.js';

@ApiTags(SwaggerTag.PRODUCTS)
@Public()
@Controller()
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get('shops/:shopId/products')
  @ApiOperation({ summary: 'List active products available in a specific shop' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Optional category UUID filter' })
  @ApiEnvelope(ProductResponseDto, { isArray: true })
  @ApiStandardResponses()
  listForShop(
    @UuidParam('shopId') shopId: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.products.listActiveForShop(shopId, categoryId);
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Get product details by UUID v7 id' })
  @ApiOkEnvelope(ProductResponseDto)
  @ApiStandardResponses()
  getById(@UuidParam('id') id: string) {
    return this.products.getPublicProduct(id);
  }
}
