import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SwaggerTag } from '#common/constants';
import {
  ApiEnvelope,
  ApiOkEnvelope,
  ApiPaginatedResponse,
  ApiStandardResponses,
  Public,
  UuidParam,
} from '#common/decorators';
import { GeoQueryDto } from '#common/dto';
import { ShopsService } from '../services/shops.service.js';
import { QueryShopsDto } from '../dto/query-shops.dto.js';
import { ShopResponseDto } from '../dto/shop-response.dto.js';

@ApiTags(SwaggerTag.SHOPS)
@Public()
@Controller('shops')
export class ShopsController {
  constructor(private readonly shops: ShopsService) {}

  @Get()
  @ApiOperation({ summary: 'List shops with filtering and pagination' })
  @ApiPaginatedResponse(ShopResponseDto)
  @ApiStandardResponses()
  list(@Query() query: QueryShopsDto) {
    return this.shops.listShops(query);
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Find nearby open shops based on GPS coordinates' })
  @ApiEnvelope(ShopResponseDto, { isArray: true })
  @ApiStandardResponses()
  nearby(@Query() geo: GeoQueryDto) {
    return this.shops.listNearby(geo.lng, geo.lat, geo.radiusKm);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get shop details by URL slug' })
  @ApiOkEnvelope(ShopResponseDto)
  @ApiStandardResponses()
  getBySlug(@Param('slug') slug: string) {
    return this.shops.getShopBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get shop details by UUID v7 id' })
  @ApiOkEnvelope(ShopResponseDto)
  @ApiStandardResponses()
  getById(@UuidParam('id') id: string) {
    return this.shops.getShopById(id);
  }
}
