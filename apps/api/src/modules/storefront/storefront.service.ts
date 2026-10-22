import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';

/**
 * Aggregated city storefront payload for the mobile homepage:
 * city info + banners + main categories + featured service kits,
 * all with city-scoped pricing when overrides exist.
 */
@Injectable()
export class StorefrontService {
  constructor(private readonly prisma: PrismaService) {}

  async getCityStorefront(citySlug: string) {
    const city = await this.prisma.city.findUnique({
      where: { slug: citySlug },
    });

    if (!city || !city.active) {
      throw new NotFoundException(`City "${citySlug}" not found or inactive`);
    }

    const [
      banners,
      categories,
      bundles,
      vendors,
      vehicleRows,
    ] = await Promise.all([
      // Banners targeted at this city plus global ones (cityId = null).
      this.prisma.banner.findMany({
        where: { active: true, OR: [{ cityId: city.id }, { cityId: null }] },
        orderBy: { sortOrder: 'asc' },
        take: 10,
      }),

      // Main marketplace categories (slugged only) with how many products
      // are actually available in this city.
      this.prisma.category.findMany({
        where: { slug: { not: null } },
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
          _count: {
            select: {
              products: {
                where: {
                  cityProducts: {
                    some: { cityId: city.id, active: true },
                  },
                },
              },
            },
          },
        },
      }),

      // Featured vehicle service packs (oil/filter kits and other
      // SERVICE_KIT products) with this city's price when overridden.
      this.prisma.product.findMany({
        where: {
          serviceType: 'SERVICE_KIT',
          cityProducts: { some: { cityId: city.id, active: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          cityProducts: {
            where: { cityId: city.id, active: true },
            select: { price: true, stock: true },
          },
        },
      }),

      // Verified local vendors active in this city.
      this.prisma.vendor.findMany({
        where: { cityId: city.id, isActive: true },
        orderBy: { rating: 'desc' },
        take: 10,
      }),

      // Distinct car models that have products in this city (for the
      // vehicle-selection sheet — no point listing cars we can't serve).
      this.prisma.product.findMany({
        where: {
          cityProducts: { some: { cityId: city.id, active: true } },
          NOT: { compatibleVehicles: { isEmpty: true } },
        },
        select: { compatibleVehicles: true },
      }),
    ]);

    // Flatten ["پراید", "پژو 405"] arrays into a distinct, sorted model list.
    const vehicles = [
      ...new Set(vehicleRows.flatMap((row) => row.compatibleVehicles)),
    ].sort((a, b) => a.localeCompare(b, 'fa'));

    return {
      city: {
        id: city.id,
        slug: city.slug,
        name: city.name,
      },
      banners,
      categories: categories.map(({ _count, ...category }) => ({
        ...category,
        productCount: _count.products,
      })),
      bundles: bundles.map((product) => this.applyCityPricing(product)),
      vendors,
      vehicles,
    };
  }

  /** Flatten a product's city override into `cityPrice`/`cityStock`. */
  private applyCityPricing<
    T extends {
      price: number;
      discountPercent?: number;
      stock: number;
      serviceType?: string;
    },
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
      hasInstallationService: product.serviceType === 'SERVICE_KIT',
    };
  }
}
