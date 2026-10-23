import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { IsString, Length } from 'class-validator';
import { PaginatedResult, ListQueryDto } from '#common/dto';
import { Permissions, Public, Roles, UuidParam } from '#common/decorators';
import { Permission, Role } from '#common/enums';
import { AppException, ErrorCode } from '#common/exceptions';
import type { AppRequest } from '#common/interfaces';
import { IsGrams } from '#common/validators';

class ProbeBodyDto {
  @IsString()
  @Length(2, 20)
  name!: string;

  @IsGrams({ step: 250 })
  grams!: number;
}

/** Test-only routes that exercise the shared HTTP pipeline. */
@Controller('probe')
export class ProbeController {
  @Get('items/:id')
  @Public()
  getItem(@UuidParam('id') id: string) {
    return { id };
  }

  @Get('items')
  @Public()
  list(@Query() query: ListQueryDto) {
    return PaginatedResult.of([{ n: 1 }, { n: 2 }], 42, query.page, query.limit);
  }

  @Post('items')
  @Public()
  create(@Body() body: ProbeBodyDto) {
    return body;
  }

  @Get('stock')
  @Public()
  outOfStock() {
    throw new AppException(ErrorCode.OUT_OF_STOCK, { details: { available: 250 } });
  }

  @Get('crash')
  @Public()
  crash() {
    throw new Error('secret internal detail');
  }

  @Get('vendor-only')
  @Roles(Role.VENDOR_OWNER)
  vendorOnly() {
    return 'ok';
  }

  @Get('needs-permission')
  @Permissions(Permission.SETTLEMENT_MANAGE)
  needsPermission(@Req() req: AppRequest) {
    return req.user?.id;
  }
}
