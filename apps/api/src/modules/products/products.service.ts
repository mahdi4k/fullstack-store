import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { Prisma } from '../../generated/prisma/client.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { ProductQueryDto } from './dto/product-query.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ProductQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    // Filter by category slug (marketplace URLs use slugs).
    if (query.category) {
      where.category = { slug: query.category };
    }

    // City-scoped availability: only products listed for this city.
    if (query.city) {
      where.cityProducts = {
        some: {
          active: true,
          city: { slug: query.city },
        },
      };
    }

    if (query.vehicle) {
      where.compatibleVehicles = { has: query.vehicle };
    }

    if (query.brand) {
      where.brand = { contains: query.brand, mode: 'insensitive' };
    }

    if (query.type) {
      where.serviceType = query.type;
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) where.price.gte = query.minPrice;
      if (query.maxPrice !== undefined) where.price.lte = query.maxPrice;
    }

    if (query.inStock) {
      where.stock = { gt: 0 };
    }

    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          cityProducts: query.city
            ? {
                where: { active: true, city: { slug: query.city } },
                select: { price: true, stock: true },
              }
            : false,
          _count: {
            select: { reviews: true },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    const data = query.city
      ? products.map((product) => this.applyCityPricing(product))
      : products;

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /** Flatten the city override into `cityPrice`/`cityStock` + `finalPrice`. */
  private applyCityPricing<
    T extends { price: number; discountPercent?: number; stock: number },
  >(
    product: T & { cityProducts?: { price: number; stock: number }[] | null | false },
  ) {
    const overrides = Array.isArray(product.cityProducts)
      ? product.cityProducts
      : [];
    const override = overrides[0];
    const price = override?.price ?? product.price;
    const { cityProducts: _omitted, ...rest } = product;
    return {
      ...rest,
      cityPrice: override?.price ?? null,
      cityStock: override?.stock ?? null,
      finalPrice: Math.round(
        price * (1 - (product.discountPercent ?? 0) / 100)
      ),
    };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const reviewStats = await this.prisma.review.aggregate({
      where: { productId: id },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return {
      ...product,
      averageRating: reviewStats._avg.rating ?? null,
      reviewsCount: reviewStats._count.rating,
    };
  }

  async findOneBySlug(slug: string, citySlug?: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        cityProducts: citySlug
          ? {
              where: { active: true, city: { slug: citySlug } },
              select: { price: true, stock: true },
            }
          : false,
        reviews: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product "${slug}" not found`);
    }

    const reviewStats = await this.prisma.review.aggregate({
      where: { productId: product.id },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const withCity = this.applyCityPricing(product);

    return {
      ...withCity,
      averageRating: reviewStats._avg.rating ?? null,
      reviewsCount: reviewStats._count.rating,
    };
  }

  async create(dto: CreateProductDto) {
    if (dto.categoryId) {
      const categoryExists = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!categoryExists) {
        throw new NotFoundException(`Category with ID ${dto.categoryId} not found`);
      }
    }

    return this.prisma.product.create({
      data: dto,
      include: {
        category: true,
      },
    });
  }

  async update(id: number, dto: UpdateProductDto) {
    await this.findOne(id);

    if (dto.categoryId) {
      const categoryExists = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!categoryExists) {
        throw new NotFoundException(`Category with ID ${dto.categoryId} not found`);
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: {
        category: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.product.delete({
      where: { id },
    });
  }
}
