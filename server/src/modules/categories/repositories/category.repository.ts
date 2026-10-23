import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '#database';
import { Category } from '../schemas/category.schema.js';

@Injectable()
export class CategoryRepository extends BaseRepository<Category> {
  constructor(@InjectModel(Category.name) model: Model<Category>) {
    super(model, 'Category');
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return this.findOne({ slug: slug.toLowerCase().trim() });
  }

  async findActiveList(): Promise<Category[]> {
    return this.findMany({ isActive: true }, { sort: { order: 1, name: 1 } });
  }

  async findByParentId(parentId: string | null): Promise<Category[]> {
    return this.findMany({ parentId, isActive: true }, { sort: { order: 1, name: 1 } });
  }
}
