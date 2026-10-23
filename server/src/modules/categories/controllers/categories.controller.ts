import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SwaggerTag } from '#common/constants';
import { ApiEnvelope, ApiOkEnvelope, ApiStandardResponses, Public, UuidParam } from '#common/decorators';
import { CategoriesService } from '../services/categories.service.js';
import { CategoryResponseDto } from '../dto/category-response.dto.js';

@ApiTags(SwaggerTag.CATEGORIES)
@Public()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get hierarchical category tree with subcategories' })
  @ApiEnvelope(CategoryResponseDto, { isArray: true })
  @ApiStandardResponses()
  listTree() {
    return this.categories.listCategoriesTree();
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get category by URL slug' })
  @ApiOkEnvelope(CategoryResponseDto)
  @ApiStandardResponses()
  getBySlug(@Param('slug') slug: string) {
    return this.categories.getCategoryBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by UUID v7 id' })
  @ApiOkEnvelope(CategoryResponseDto)
  @ApiStandardResponses()
  getById(@UuidParam('id') id: string) {
    return this.categories.getCategoryById(id);
  }
}
