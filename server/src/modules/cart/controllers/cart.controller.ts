import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SwaggerTag } from '#common/constants';
import {
  ApiOkEnvelope,
  ApiStandardResponses,
  Auth,
  CurrentUser,
  UuidParam,
} from '#common/decorators';
import { CartService } from '../services/cart.service.js';
import { AddCartItemDto } from '../dto/add-cart-item.dto.js';
import { CartResponseDto } from '../dto/cart-response.dto.js';

@ApiTags(SwaggerTag.CART)
@Auth()
@Controller('cart')
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current customer cart with live pricing and stock validation' })
  @ApiOkEnvelope(CartResponseDto)
  @ApiStandardResponses()
  getCart(@CurrentUser('id') customerId: string) {
    return this.cart.getCart(customerId);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add product portion to cart with weight, cuts, and single-shop checks' })
  @ApiOkEnvelope(CartResponseDto)
  @ApiStandardResponses()
  addItem(@CurrentUser('id') customerId: string, @Body() dto: AddCartItemDto) {
    return this.cart.addItem(customerId, dto);
  }

  @Delete('items/:productId')
  @ApiOperation({ summary: 'Remove a product from customer cart' })
  @ApiOkEnvelope(CartResponseDto)
  @ApiStandardResponses()
  removeItem(
    @CurrentUser('id') customerId: string,
    @UuidParam('productId') productId: string,
  ) {
    return this.cart.removeItem(customerId, productId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear all items from current cart' })
  @ApiOkEnvelope(CartResponseDto)
  @ApiStandardResponses()
  clearCart(@CurrentUser('id') customerId: string) {
    return this.cart.clearCart(customerId);
  }
}
