import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './schemas/category.schema.js';
import { CategoryRepository } from './repositories/category.repository.js';
import { CategoriesService } from './services/categories.service.js';
import { CategoriesController } from './controllers/categories.controller.js';
import { AdminCategoriesController } from './controllers/admin-categories.controller.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }])],
  controllers: [CategoriesController, AdminCategoriesController],
  providers: [CategoryRepository, CategoriesService],
  exports: [CategoriesService, CategoryRepository],
})
export class CategoriesModule {}
