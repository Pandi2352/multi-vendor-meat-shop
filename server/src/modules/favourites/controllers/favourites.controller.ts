import { Controller, Delete, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SwaggerTag } from '#common/constants';
import {
  ApiOkEnvelope,
  ApiStandardResponses,
  Auth,
  CurrentUser,
  UuidParam,
} from '#common/decorators';
import { Role } from '#common/enums';
import { FavouritesService } from '../services/favourites.service.js';
import { FavouriteItemResponseDto, ToggleFavouriteResponseDto } from '../dto/favourite-response.dto.js';

@ApiTags(SwaggerTag.FAVOURITES)
@ApiBearerAuth()
@Auth(Role.CUSTOMER)
@Controller('favourites')
export class FavouritesController {
  constructor(private readonly favourites: FavouritesService) {}

  @Get()
  @ApiOperation({ summary: 'List customer favourite meat cuts with live availability' })
  @ApiOkEnvelope(FavouriteItemResponseDto, { isArray: true })
  @ApiStandardResponses()
  list(@CurrentUser('id') customerId: string): Promise<FavouriteItemResponseDto[]> {
    return this.favourites.getCustomerFavourites(customerId);
  }

  @Get('ids')
  @ApiOperation({ summary: 'Get list of favourited product IDs for fast badge/heart status' })
  @ApiStandardResponses()
  listIds(@CurrentUser('id') customerId: string): Promise<string[]> {
    return this.favourites.getCustomerFavouriteIds(customerId);
  }

  @Post(':productId/toggle')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle favourite status for a meat product' })
  @ApiOkEnvelope(ToggleFavouriteResponseDto)
  @ApiStandardResponses()
  toggle(
    @CurrentUser('id') customerId: string,
    @UuidParam('productId') productId: string,
  ): Promise<ToggleFavouriteResponseDto> {
    return this.favourites.toggleFavourite(customerId, productId);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove a meat product from customer favourites' })
  @ApiStandardResponses()
  remove(
    @CurrentUser('id') customerId: string,
    @UuidParam('productId') productId: string,
  ): Promise<{ removed: boolean }> {
    return this.favourites.removeFavourite(customerId, productId);
  }
}
