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

## Base entity (every schema extends it)
```ts
// database/base.schema-options.ts
export const baseSchemaOptions: SchemaOptions = {
  timestamps: true,
  versionKey: false,
  id: false,
  toJSON: { virtuals: true, transform: toPublicJson },
  toObject: { virtuals: true, transform: toPublicJson },
};

// database/base.entity.ts
export abstract class BaseEntity {
  @Prop({ type: String, default: generateId })
  _id: string;

  createdAt: Date;
  updatedAt: Date;
}
```

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
export const ProductSchema = createSchema(Product);
ProductSchema.index({ shopId: 1, status: 1 });
```

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
  constructor(@InjectModel(Product.name) model: Model<Product>) { super(model); }

  findActiveByShop(shopId: string, query: QueryProductsDto) {
    return this.paginate({ shopId, status: ProductStatus.ACTIVE }, query, { sortable: ['name', 'pricePerKgPaise', 'createdAt'] });
  }
}
```
- Generic CRUD/paginate/softDelete/exists come from `BaseRepository`; only add domain queries.
- Every method takes optional `session?: ClientSession`.
- Use `.lean()` for reads that go straight to mappers.

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
