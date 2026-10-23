import { Body, Controller, Delete, Get, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SwaggerTag } from '#common/constants';
import { Role } from '#common/enums';
import {
  ApiCreatedEnvelope,
  ApiOkEnvelope,
  ApiPaginatedResponse,
  ApiStandardResponses,
  Auth,
  UuidParam,
} from '#common/decorators';
import { CategoriesService } from '../services/categories.service.js';
import { CreateCategoryDto } from '../dto/create-category.dto.js';
import { UpdateCategoryDto } from '../dto/update-category.dto.js';
import { QueryCategoriesDto } from '../dto/query-categories.dto.js';
import { CategoryResponseDto } from '../dto/category-response.dto.js';

@ApiTags(SwaggerTag.ADMIN_CATEGORIES)
@Auth(Role.ADMIN)
@Controller('admin/categories')
export class AdminCategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List categories with filtering and pagination' })
  @ApiPaginatedResponse(CategoryResponseDto)
  @ApiStandardResponses()
  list(@Query() query: QueryCategoriesDto) {
    return this.categories.listAdminCategories(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new marketplace category' })
  @ApiCreatedEnvelope(CategoryResponseDto)
  @ApiStandardResponses()
  create(@Body() dto: CreateCategoryDto) {
    return this.categories.createCategory(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing category' })
  @ApiOkEnvelope(CategoryResponseDto)
  @ApiStandardResponses()
  update(@UuidParam('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categories.updateCategory(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate a category' })
  @ApiOkEnvelope(CategoryResponseDto)
  @ApiStandardResponses()
  delete(@UuidParam('id') id: string) {
    return this.categories.deleteCategory(id);
  }
}
