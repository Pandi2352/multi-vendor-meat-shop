import type {
  ClientSession,
  Model,
  PipelineStage,
  ProjectionType,
  QueryFilter,
  UpdateQuery,
} from 'mongoose';
import { PaginatedResult, type ListQueryDto } from '#common/dto';
import { assertFound } from '#common/exceptions';
import { getSkip } from '#common/utils';
import type { BaseEntity } from './base.entity.js';
import { WITH_DELETED } from './plugins/soft-delete.plugin.js';
import { buildSearchFilter, buildSort, type SortSpec } from './query/query-builders.js';

export interface RepositoryOptions<T> {
  session?: ClientSession;
  projection?: ProjectionType<T>;
  /** Include soft-deleted documents. */
  withDeleted?: boolean;
}

export interface FindManyOptions<T> extends RepositoryOptions<T> {
  sort?: SortSpec;
  limit?: number;
  skip?: number;
}

export interface PaginateOptions<T> extends RepositoryOptions<T> {
  /** Fields clients may sort by (createdAt is always allowed). */
  sortable: readonly string[];
  /** Fields matched by `?q=`. */
  searchable?: readonly string[];
  defaultSort?: string;
}

/** Fields the database fills in. */
export type CreateInput<T> = Omit<T, '_id' | 'createdAt' | 'updatedAt'> & { _id?: string };

/**
 * Generic data access for every collection. Feature repositories extend it and add domain queries.
 * Reads return plain objects (`lean`) with `_id`; mappers turn them into response DTOs.
 */
export abstract class BaseRepository<T extends BaseEntity> {
  protected constructor(
    protected readonly model: Model<T>,
    protected readonly entityName: string,
  ) {}

  findById(id: string, options: RepositoryOptions<T> = {}): Promise<T | null> {
    return this.model.findById(id, options.projection, this.queryOptions(options)).lean<T>().exec();
  }

  async findByIdOrThrow(id: string, options: RepositoryOptions<T> = {}): Promise<T> {
    const doc = await this.findById(id, options);
    assertFound(doc, this.entityName, id);
    return doc;
  }

  findOne(filter: QueryFilter<T>, options: RepositoryOptions<T> = {}): Promise<T | null> {
    return this.model
      .findOne(filter, options.projection, this.queryOptions(options))
      .lean<T>()
      .exec();
  }

  findMany(filter: QueryFilter<T>, options: FindManyOptions<T> = {}): Promise<T[]> {
    const query = this.model.find(filter, options.projection, this.queryOptions(options));
    if (options.sort) query.sort(options.sort);
    if (options.skip) query.skip(options.skip);
    if (options.limit) query.limit(options.limit);
    return query.lean<T[]>().exec();
  }

  async paginate(
    filter: QueryFilter<T>,
    query: ListQueryDto,
    options: PaginateOptions<T>,
  ): Promise<PaginatedResult<T>> {
    const search = buildSearchFilter(query.q, options.searchable ?? []);
    const fullFilter = (search.$or ? { $and: [filter, search] } : filter) as QueryFilter<T>;
    const sort = buildSort(query.sort, options.sortable, options.defaultSort);

    const [items, total] = await Promise.all([
      this.findMany(fullFilter, {
        ...options,
        sort,
        skip: getSkip(query.page, query.limit),
        limit: query.limit,
      }),
      this.count(fullFilter, options),
    ]);
    return PaginatedResult.of(items, total, query.page, query.limit);
  }

  async create(data: CreateInput<T>, options: RepositoryOptions<T> = {}): Promise<T> {
    const doc = await new this.model(data).save({ session: options.session });
    return doc.toObject({ transform: false, virtuals: false }) as T;
  }

  async createMany(data: CreateInput<T>[], options: RepositoryOptions<T> = {}): Promise<T[]> {
    const docs = await this.model.insertMany(data, { session: options.session });
    return docs.map((doc) => doc.toObject({ transform: false, virtuals: false }) as T);
  }

  updateById(
    id: string,
    update: UpdateQuery<T>,
    options: RepositoryOptions<T> = {},
  ): Promise<T | null> {
    return this.model
      .findByIdAndUpdate(id, update, {
        ...this.queryOptions(options),
        returnDocument: 'after',
        runValidators: true,
      })
      .lean<T>()
      .exec();
  }

  async updateByIdOrThrow(
    id: string,
    update: UpdateQuery<T>,
    options: RepositoryOptions<T> = {},
  ): Promise<T> {
    const doc = await this.updateById(id, update, options);
    assertFound(doc, this.entityName, id);
    return doc;
  }

  /** Returns true when a document matched. */
  async updateOne(
    filter: QueryFilter<T>,
    update: UpdateQuery<T>,
    options: RepositoryOptions<T> = {},
  ): Promise<boolean> {
    const result = await this.model.updateOne(filter, update, {
      ...this.queryOptions(options),
      runValidators: true,
    });
    return result.matchedCount > 0;
  }

  /** Only for schemas created with `{ softDelete: true }`. */
  softDelete(id: string, deletedBy?: string, options: RepositoryOptions<T> = {}): Promise<boolean> {
    return this.updateOne(
      { _id: id },
      {
        $set: { deletedAt: new Date(), deletedBy: deletedBy ?? null },
      },
      options,
    );
  }

  restore(id: string, options: RepositoryOptions<T> = {}): Promise<boolean> {
    return this.updateOne(
      { _id: id, deletedAt: { $ne: null } },
      {
        $set: { deletedAt: null, deletedBy: null },
      },
      options,
    );
  }

  async exists(filter: QueryFilter<T>, options: RepositoryOptions<T> = {}): Promise<boolean> {
    const query = this.model.exists(filter).setOptions(this.queryOptions(options));
    return (await query.exec()) !== null;
  }

  count(filter: QueryFilter<T>, options: RepositoryOptions<T> = {}): Promise<number> {
    return this.model.countDocuments(filter, this.queryOptions(options)).exec();
  }

  aggregate<R>(pipeline: PipelineStage[], options: RepositoryOptions<T> = {}): Promise<R[]> {
    const aggregation = this.model
      .aggregate<R>(pipeline)
      .option(options.withDeleted ? WITH_DELETED : {});
    if (options.session) aggregation.session(options.session);
    return aggregation.exec();
  }

  private queryOptions(options: RepositoryOptions<T>) {
    return { session: options.session, ...(options.withDeleted ? WITH_DELETED : {}) };
  }
}
