import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SwaggerTag } from '#common/constants';
import { ApiOkEnvelope, ApiStandardResponses, Auth, CurrentUser } from '#common/decorators';
import { CartService } from '../services/cart.service.js';
import { CheckoutQuoteQueryDto } from '../dto/checkout-quote-query.dto.js';
import { CheckoutQuoteResponseDto } from '../dto/checkout-quote-response.dto.js';

@ApiTags(SwaggerTag.CHECKOUT)
@Auth()
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly cart: CartService) {}

  @Get('quote')
  @ApiOperation({ summary: 'Calculate checkout quote with items subtotal, fees, and serviceability checks' })
  @ApiOkEnvelope(CheckoutQuoteResponseDto)
  @ApiStandardResponses()
  getQuote(
    @CurrentUser('id') customerId: string,
    @Query() query: CheckoutQuoteQueryDto,
  ) {
    return this.cart.getCheckoutQuote(customerId, query);
  }
}
