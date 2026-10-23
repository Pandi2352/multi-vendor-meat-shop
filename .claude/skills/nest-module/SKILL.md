---
name: nest-module
description: Use when creating or changing a NestJS feature module, controller, service, DTO or Swagger docs in server/. Enforces the module template, thin controllers, typed config, UUID params, shared decorators and the response envelope.
---

# NestJS module

## Folder template
```
server/src/modules/<feature>/
  <feature>.module.ts
  controllers/  <feature>.controller.ts            # customer/public routes
                vendor-<feature>.controller.ts     # /vendor/... routes
                admin-<feature>.controller.ts      # /admin/... routes
  services/     <feature>.service.ts               # orchestration
                <feature>-<concern>.service.ts     # split when > 250 lines
  repositories/ <feature>.repository.ts            # extends BaseRepository<T>
  schemas/      <feature>.schema.ts                # see mongo-schema skill
  dto/          create-<x>.dto.ts, update-<x>.dto.ts, query-<x>.dto.ts, <x>-response.dto.ts
  mappers/      <feature>.mapper.ts                # entity → response DTO
  constants/    <feature>.constants.ts
  events/       <feature>-<event>.event.ts
  index.ts
```

## Controller pattern (thin)
```ts
@ApiTags(SwaggerTag.VENDOR_PRODUCTS)
@Controller('vendor/products')
@Auth(Role.VENDOR_OWNER, Role.VENDOR_STAFF)
export class VendorProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  @ApiPaginatedResponse(ProductResponseDto)
  @ApiListQuery()
  list(@CurrentShop() shopId: string, @Query() query: QueryProductsDto) {
    return this.products.listForShop(shopId, query);
  }

  @Patch(':id')
  @ApiOkEnvelope(ProductResponseDto)
  @ApiStandardResponses()
  @Audit('product.update', 'product')
  update(@CurrentShop() shopId: string, @UuidParam('id') id: string, @Body() dto: UpdateProductDto) {
    return this.products.update(shopId, id, dto);
  }
}
```
Rules:
- No business logic, no repository access, no try/catch in controllers.
- Ownership ids (`shopId`, `userId`) come from `@CurrentShop()` / `@CurrentUser()`, never from body or query.
- Every id param uses `@UuidParam()`.
- Every handler has a Swagger response decorator from `common/decorators`.

## Service pattern
- Inject repositories and other services; never the Mongoose model directly outside the repository.
- Throw `AppException` / `NotFoundAppException` with an `ErrorCode`; use `assertFound`, `assertOwner`.
- Money via `common/utils/money`, weights via `common/utils/quantity`, dates via `common/utils/date` (IST).
- Status changes via the module's state machine: `orderMachine.assertTransition(from, to, actorRole)`.
- Multi-document writes via `runInTransaction(connection, async (session) => ...)` and pass `session` to every repository call.
- Emit domain events (`EventName.ORDER_PLACED`) instead of calling notification/analytics services directly.
- Read config through `AppConfigService`, never `process.env`.

## DTO pattern
```ts
export class CreateProductDto {
  @ApiProperty({ example: 'Chicken curry cut' })
  @Trim() @IsString() @Length(2, 80)
  name: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID('7')
  categoryId: string;

  @ApiProperty({ description: 'Price per kg in paise', example: 28000 })
  @IsPaise()
  pricePerKgPaise: number;
}
export class UpdateProductDto extends PartialType(CreateProductDto) {}
export class QueryProductsDto extends ListQueryDto { /* extra filters */ }
```
- `PartialType` / `PickType` / `OmitType` from `@nestjs/swagger` to derive DTOs — never duplicate fields.
- Response DTOs are separate classes; mappers build them. Never return raw documents.
- List endpoints extend `ListQueryDto` and return `PaginatedResponseDto<T>` from `BaseRepository.paginate`.

## Module registration
- `MongooseModule.forFeature([{ name: X.name, schema: XSchema }])` only in the owning module. Other modules import the owning module and use its exported service.
- Export services, not repositories.

## Done checklist
- [ ] Files within size limits, barrel `index.ts` updated
- [ ] Swagger shows request/response/error schemas
- [ ] Unit tests for service rules, e2e test for main route
- [ ] `bash scripts/check-rules.sh` passes
