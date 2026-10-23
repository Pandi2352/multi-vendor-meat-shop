import { getModelToken } from '@nestjs/mongoose';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { Model } from 'mongoose';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { ListQueryDto } from '#common/dto';
import { AppException, NotFoundAppException } from '#common/exceptions';
import { generateId, isUuid } from '#common/utils';
import { TestItem, TestItemModule, TestItemRepository } from './fixtures/test-item.schema.js';
import { createTestApp } from './helpers/create-test-app.js';

const listQuery = (overrides: Partial<ListQueryDto> = {}): ListQueryDto => ({
  page: 1,
  limit: 2,
  ...overrides,
});

describe('BaseRepository (e2e, real MongoDB)', () => {
  let app: NestExpressApplication;
  let repo: TestItemRepository;
  let model: Model<TestItem>;
  const shopId = generateId();

  beforeAll(async () => {
    app = await createTestApp({ imports: [TestItemModule] });
    repo = app.get(TestItemRepository);
    model = app.get(getModelToken(TestItem.name));
    await model.syncIndexes();
  });

  beforeEach(async () => {
    await model.deleteMany({}).setOptions({ withDeleted: true });
  });

  afterAll(async () => {
    await model.collection.drop().catch(() => undefined);
    await app.close();
  });

  const seed = () =>
    repo.createMany([
      { sku: 'CK-CURRY', name: 'Chicken curry cut', pricePerKgPaise: 26_000, shopId },
      { sku: 'CK-BONELESS', name: 'Chicken boneless', pricePerKgPaise: 34_000, shopId },
      { sku: 'MT-CURRY', name: 'Mutton curry cut', pricePerKgPaise: 80_000, shopId },
    ]);

  it('stores UUID v7 string ids, never ObjectId', async () => {
    const created = await repo.create({
      sku: 'FISH-1',
      name: 'Seer fish',
      pricePerKgPaise: 90_000,
      shopId,
    });
    expect(isUuid(created._id)).toBe(true);

    const raw = await model.collection.findOne({ sku: 'FISH-1' });
    expect(typeof raw?._id).toBe('string');
    expect(raw?._id).toBe(created._id);
  });

  it('serialises _id as id in JSON', async () => {
    const created = await repo.create({
      sku: 'FISH-2',
      name: 'Prawns',
      pricePerKgPaise: 60_000,
      shopId,
    });
    const json = (await model.findById(created._id))!.toJSON() as unknown as Record<
      string,
      unknown
    >;
    expect(json.id).toBe(created._id);
    expect(json._id).toBeUndefined();
  });

  it('finds by id or throws NotFound', async () => {
    const [item] = await seed();
    await expect(repo.findByIdOrThrow(item._id)).resolves.toMatchObject({ sku: item.sku });
    await expect(repo.findByIdOrThrow(generateId())).rejects.toBeInstanceOf(NotFoundAppException);
  });

  it('paginates with search and whitelisted sort', async () => {
    await seed();
    const page = await repo.paginate(
      { shopId },
      listQuery({ q: 'curry', sort: '-pricePerKgPaise' }),
      {
        sortable: ['pricePerKgPaise'],
        searchable: ['name', 'sku'],
      },
    );
    expect(page.items.map((i) => i.sku)).toEqual(['MT-CURRY', 'CK-CURRY']);
    expect(page.meta).toMatchObject({ total: 2, totalPages: 1, hasNext: false });

    await expect(
      repo.paginate({}, listQuery({ sort: 'shopId' }), { sortable: ['name'] }),
    ).rejects.toBeInstanceOf(AppException);
  });

  it('updates and returns the new document', async () => {
    const [item] = await seed();
    const updated = await repo.updateByIdOrThrow(item._id, { $set: { pricePerKgPaise: 27_000 } });
    expect(updated.pricePerKgPaise).toBe(27_000);
  });

  it('soft-deletes, hides and restores', async () => {
    const [item] = await seed();
    expect(await repo.softDelete(item._id, generateId())).toBe(true);
    expect(await repo.findById(item._id)).toBeNull();
    expect(await repo.count({ shopId })).toBe(2);
    expect(await repo.findById(item._id, { withDeleted: true })).toMatchObject({ sku: item.sku });
    expect(await repo.aggregate([{ $match: { shopId } }])).toHaveLength(2);

    expect(await repo.restore(item._id)).toBe(true);
    expect(await repo.exists({ _id: item._id })).toBe(true);
  });

  it('surfaces duplicate keys as Mongo error 11000', async () => {
    await seed();
    await expect(
      repo.create({ sku: 'CK-CURRY', name: 'Duplicate', pricePerKgPaise: 1, shopId }),
    ).rejects.toMatchObject({ code: 11000 });
  });
});
