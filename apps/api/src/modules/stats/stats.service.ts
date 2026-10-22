import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { OrderStatus, PaymentStatus } from '../../generated/prisma/client.js';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * One call for the dashboard overview: counters, revenue, low stock,
   * best sellers and the latest orders.
   */
  async getStats() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      pendingOrders,
      todayOrders,
      totalCustomers,
      revenueAgg,
      lowStockProducts,
      topGroup,
      recentOrders,
    ] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      this.prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { paymentStatus: PaymentStatus.PAID },
      }),
      this.prisma.product.findMany({
        where: { stock: { lte: 5 } },
        select: { id: true, name: true, stock: true, imageUrl: true },
        orderBy: { stock: 'asc' },
        take: 5,
      }),
      this.prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        _count: { id: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
      this.prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
        include: {
          user: { select: { email: true, name: true } },
          items: true,
        },
      }),
    ]);

    // Resolve best-seller names from the grouped ids.
    const topProducts = await this.prisma.product.findMany({
      where: { id: { in: topGroup.map((row) => row.productId) } },
      select: { id: true, name: true },
    });
    const nameById = new Map(topProducts.map((product) => [product.id, product.name]));
    const bestSellers = topGroup.map((row) => ({
      productId: row.productId,
      name: nameById.get(row.productId) ?? `#${row.productId}`,
      quantity: row._sum.quantity ?? 0,
      orders: row._count.id,
    }));

    return {
      totalOrders,
      pendingOrders,
      todayOrders,
      totalCustomers,
      revenue: revenueAgg._sum.totalAmount ?? 0,
      lowStockProducts,
      bestSellers,
      recentOrders,
    };
  }
}
