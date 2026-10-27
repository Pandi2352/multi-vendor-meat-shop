import type { MongooseQueryMiddleware, Query, Schema } from 'mongoose';

/** Query option that includes soft-deleted documents: `Model.find(filter).setOptions({ withDeleted: true })`. */
export const WITH_DELETED = { withDeleted: true } as const;

const QUERY_HOOKS: MongooseQueryMiddleware[] = [
  'countDocuments',
  'find',
  'findOne',
  'findOneAndDelete',
  'findOneAndReplace',
  'findOneAndUpdate',
  'updateMany',
  'updateOne',
];

/**
 * Adds `deletedAt` / `deletedBy` and hides soft-deleted documents from queries and aggregations,
 * unless the query sets `withDeleted` or filters on `deletedAt` itself.
 */
export const softDeletePlugin = (schema: Schema): void => {
  schema.add({
    deletedAt: { type: Date, default: null, index: true },
    deletedBy: { type: String, default: null },
  });

  schema.pre(QUERY_HOOKS, function (this: Query<unknown, unknown>) {
    const options = this.getOptions() as { withDeleted?: boolean };
    if (options.withDeleted || 'deletedAt' in this.getFilter()) return;
    this.where({ deletedAt: null });
  });

  schema.pre('aggregate', function () {
    const options = this.options as { withDeleted?: boolean };
    if (options.withDeleted) return;
    const pipeline = this.pipeline();
    const first = pipeline[0] as { $geoNear?: { query?: Record<string, unknown> } } | undefined;
    // $geoNear must stay the first stage, so the filter goes inside it instead of in front.
    if (first?.$geoNear) {
      first.$geoNear.query = { ...first.$geoNear.query, deletedAt: null };
      return;
    }
    pipeline.unshift({ $match: { deletedAt: null } });
  });
};
