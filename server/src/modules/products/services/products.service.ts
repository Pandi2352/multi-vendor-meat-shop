import { Injectable } from '@nestjs/common';
import { ConflictAppException, NotFoundAppException } from '#common/exceptions';
import { slugify } from '#common/utils';
import { PaginatedResult } from '#common/dto';
import { CutType, ProductStatus, SellMode, Unit } from '#common/enums';
import { CategoriesService } from '#modules/categories';
import { PRODUCT_STATUS_MACHINE } from '../constants/product.constants.js';
import { ProductRepository } from '../repositories/product.repository.js';
import { CreateProductDto } from '../dto/create-product.dto.js';
import { UpdateProductDto } from '../dto/update-product.dto.js';
import { QueryProductsDto } from '../dto/query-products.dto.js';
import { ProductResponseDto } from '../dto/product-response.dto.js';
import { toProductResponseDto } from '../mappers/product.mapper.js';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productRepo: ProductRepository,
    private readonly categories: CategoriesService,
  ) {}

  async listActiveForShop(shopId: string, categoryId?: string): Promise<ProductResponseDto[]> {
    const products = await this.productRepo.findActiveByShop(shopId, categoryId);
    return products.map((p) => toProductResponseDto(p));
  }

  async getPublicProduct(productId: string): Promise<ProductResponseDto> {
    const product = await this.productRepo.findById(productId);
    if (!product || product.status !== ProductStatus.ACTIVE) {
      throw new NotFoundAppException('Product', productId);
    }
    return toProductResponseDto(product);
  }

  async listForVendor(
    shopId: string,
    query: QueryProductsDto,
  ): Promise<PaginatedResult<ProductResponseDto>> {
    const filter: Record<string, unknown> = { shopId };
    if (query.categoryId) filter.categoryId = query.categoryId;
    if (query.cutType) filter.cutType = query.cutType;
    if (query.sellMode) filter.sellMode = query.sellMode;
    if (query.status) filter.status = query.status;
    if (query.q) filter.name = { $regex: query.q, $options: 'i' };

    const result = await this.productRepo.paginate(filter, query, {
      sortable: ['name', 'pricePerKgPaise', 'status', 'createdAt'],
      defaultSort: '-createdAt',
    });

    return result.map((p) => toProductResponseDto(p));
  }

  async getForVendor(shopId: string, productId: string): Promise<ProductResponseDto> {
    const product = await this.productRepo.findOne({ _id: productId, shopId });
    if (!product) throw new NotFoundAppException('Product', productId);
    return toProductResponseDto(product);
  }

  async createForVendor(shopId: string, dto: CreateProductDto): Promise<ProductResponseDto> {
    await this.categories.getCategoryById(dto.categoryId);

    const slug = dto.slug ? slugify(dto.slug) : slugify(dto.name);
    const existing = await this.productRepo.findByShopAndSlug(shopId, slug);
    if (existing) {
      throw new ConflictAppException(`Product with slug '${slug}' already exists in your shop`);
    }

    const created = await this.productRepo.create({
      shopId,
      categoryId: dto.categoryId,
      name: dto.name,
      slug,
      description: dto.description,
      images: dto.images || [],
      sellMode: dto.sellMode ?? SellMode.FIXED_WEIGHT,
      unit: dto.unit ?? Unit.GRAM,
      cutType: dto.cutType ?? CutType.CURRY_CUT,
      allowedPreparation: dto.allowedPreparation || [],
      pricePerKgPaise: dto.pricePerKgPaise,
      mrpPerKgPaise: dto.mrpPerKgPaise,
      minGrams: dto.minGrams ?? 250,
      maxGrams: dto.maxGrams ?? 5000,
      stepGrams: dto.stepGrams ?? 250,
      allowedWeightsGrams: dto.allowedWeightsGrams || [250, 500, 1000],
      piecePricePaise: dto.piecePricePaise,
      status: dto.status ?? ProductStatus.ACTIVE,
      isFreshDaily: dto.isFreshDaily ?? true,
      storageTemp: dto.storageTemp ?? '0-4°C',
      shelfLifeDays: dto.shelfLifeDays ?? 1,
    });

    return toProductResponseDto(created);
  }

  async updateForVendor(
    shopId: string,
    productId: string,
    dto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const product = await this.productRepo.findOne({ _id: productId, shopId });
    if (!product) throw new NotFoundAppException('Product', productId);

    if (dto.categoryId) {
      await this.categories.getCategoryById(dto.categoryId);
    }

    let slug: string | undefined;
    if (dto.slug || dto.name) {
      slug = dto.slug ? slugify(dto.slug) : slugify(dto.name!);
      const existing = await this.productRepo.findByShopAndSlug(shopId, slug);
      if (existing && existing._id !== productId) {
        throw new ConflictAppException(`Product with slug '${slug}' already exists in your shop`);
      }
    }

    if (dto.status && dto.status !== product.status) {
      PRODUCT_STATUS_MACHINE.assertTransition(product.status, dto.status);
    }

    const updated = await this.productRepo.updateById(productId, {
      ...dto,
      ...(slug ? { slug } : {}),
    });

    if (!updated) throw new NotFoundAppException('Product', productId);
    return toProductResponseDto(updated);
  }

  async archiveForVendor(shopId: string, productId: string): Promise<ProductResponseDto> {
    return this.updateForVendor(shopId, productId, { status: ProductStatus.ARCHIVED });
  }
}
