---
name: mongo-schema
description: Use when creating or changing a Mongoose schema, index, repository, transaction or seed in server/. Enforces UUID v7 string ids (never ObjectId), integer paise/grams, base entity, indexes and repository pattern.
---

# Mongo schema & repository

## IDs — UUID v7, never ObjectId
```ts
// common/utils/id.util.ts
import { v7 as uuidv7, validate, version } from 'uuid';
export const generateId = (): string => uuidv7();
export const isUuid = (v: unknown): v is string => typeof v === 'string' && validate(v) && version(v) === 7;
```

## Base entity (every schema extends it) — `server/src/database/base.entity.ts`
```ts
export const baseSchemaOptions: SchemaOptions = {
  timestamps: true, versionKey: false, id: false,
  toJSON: { virtuals: true, transform: toPublicJson },   // _id → id
  toObject: { virtuals: true, transform: toPublicJson },
};

export abstract class BaseEntity {
  @Prop({ type: String, default: generateId })
  _id!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
```
Import everything from `#database`: `BaseEntity`, `baseSchemaOptions`, `createSchema`, `BaseRepository`, `CollectionName`, `GeoPointSchema`, `runInTransaction`, `buildFilter`.

## Schema pattern
```ts
@Schema({ ...baseSchemaOptions, collection: CollectionName.PRODUCTS })
export class Product extends BaseEntity {
  @Prop({ type: String, ref: 'Shop', required: true, index: true })
  shopId: string;

  @Prop({ type: String, ref: 'Category', required: true })
  categoryId: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: Number, required: true, min: 0 })
  pricePerKgPaise: number;            // integer paise

  @Prop({ type: String, enum: SellMode, required: true })
  sellMode: SellMode;

  @Prop({ type: [ProductVariantSchema], default: [] })
  variants: ProductVariant[];          // sub-docs: `@Schema({ _id: false })` + own `id: string` if referenced

  @Prop({ type: String, enum: ProductStatus, default: ProductStatus.DRAFT, index: true })
  status: ProductStatus;
}
export type ProductDocument = HydratedDocument<Product>;
export const ProductSchema = createSchema(Product, { softDelete: true });
ProductSchema.index({ shopId: 1, status: 1 }); // vendor product list
```
- Class fields use definite assignment (`name!: string`) — the project is `strict`.
- `createSchema(Class, { softDelete: true })` adds `deletedAt`/`deletedBy` and hides deleted docs. Never on ledgers, movements or events.

## Rules
- References: `type: String, ref: '<Model>'`. Never `Schema.Types.ObjectId` / `Types.ObjectId`.
- Field naming carries the unit: `amountPaise`, `availableGrams`, `radiusKm`, `durationMinutes`.
- Money and quantity are integers (`Number` + validator `Number.isInteger`). No decimals.
- Enums from `common/enums`, never string literals in the schema.
- Geo: embed `GeoPointSchema` (`{ type: 'Point', coordinates: [lng, lat] }`) + `schema.index({ location: '2dsphere' })`.
- Order items are **snapshots** (name, variant label, unit price, options, tax) — not refs to live product data.
- Status history goes to a separate events collection (`order_events`), not an unbounded array.
- Ledger and movement collections are append-only: no update/delete methods in their repositories.
- Collection names from `CollectionName` enum, `snake_case` plural.
- Add every index in the schema file, with a comment naming the query it serves.
- TTL indexes only on truly disposable docs (sessions, reservations, idempotency records).

## Repository
```ts
@Injectable()
export class ProductsRepository extends BaseRepository<Product> {
  constructor(@InjectModel(Product.name) model: Model<Product>) {
    super(model, 'Product'); // entity name used in NOT_FOUND messages
  }

  findActiveByShop(shopId: string, query: QueryProductsDto) {
    return this.paginate({ shopId, status: ProductStatus.ACTIVE }, query, {
      sortable: ['name', 'pricePerKgPaise'],
      searchable: ['name'],
    });
  }
}
```
- Generic methods come from `BaseRepository`: `findById(OrThrow)`, `findOne`, `findMany`, `paginate`, `create(Many)`, `updateById(OrThrow)`, `updateOne`, `softDelete`, `restore`, `exists`, `count`, `aggregate`. Only add domain queries.
- Every method takes `{ session?, projection?, withDeleted? }`.
- Reads are `lean` plain objects with `_id`; mappers produce `id` in response DTOs.
- `paginate` returns `PaginatedResult<T>`; `.map(toResponse)` keeps the meta.

## Mongoose 9 notes
- Filter type is `QueryFilter<T>` (renamed from `FilterQuery`).
- Use `returnDocument: 'after'`, not `new: true`.
- Pre middleware has no `next()` — return or throw.
- Inside generic code, `Model.create()` overloads don't resolve; `BaseRepository.create` uses `new this.model(data).save({ session })`.

## Atomic stock update (pattern for any counter)
```ts
const updated = await this.model.findOneAndUpdate(
  { _id: batchId, shopId, availableGrams: { $gte: grams } },
  { $inc: { availableGrams: -grams } },
  { new: true, session },
);
if (!updated) throw new AppException(ErrorCode.OUT_OF_STOCK);
await this.movements.create({ shopId, productId, type: MovementType.RESERVED, grams, referenceId }, session);
```

## Transactions
Use `runInTransaction(connection, fn)` from `database/transaction.helper.ts`. Transactions require MongoDB running as a replica set (local `mongod --replSet rs0`, Atlas in production, `MongoMemoryReplSet` in tests). On a standalone server the helper throws a clear error instead of silently writing without a transaction.
