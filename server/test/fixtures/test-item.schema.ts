import { Injectable, Module } from '@nestjs/common';
import { InjectModel, MongooseModule, Prop, Schema } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { BaseEntity, BaseRepository, baseSchemaOptions, createSchema } from '#database';

/** Test-only collection used to exercise BaseEntity, plugins and BaseRepository against a real MongoDB. */
@Schema({ ...baseSchemaOptions, collection: 'test_items' })
export class TestItem extends BaseEntity {
  @Prop({ required: true, unique: true })
  sku!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ type: Number, required: true })
  pricePerKgPaise!: number;

  @Prop({ type: String, ref: 'Shop', required: true })
  shopId!: string;
}

export const TestItemSchema = createSchema(TestItem, { softDelete: true });

@Injectable()
export class TestItemRepository extends BaseRepository<TestItem> {
  constructor(@InjectModel(TestItem.name) model: Model<TestItem>) {
    super(model, 'TestItem');
  }
}

@Module({
  imports: [MongooseModule.forFeature([{ name: TestItem.name, schema: TestItemSchema }])],
  providers: [TestItemRepository],
  exports: [TestItemRepository, MongooseModule],
})
export class TestItemModule {}
