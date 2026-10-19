import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { OrderStatus, PaymentStatus } from '../../generated/prisma/client.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';
import { CheckoutDto } from './dto/checkout.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async checkout(userId: number, dto: CheckoutDto) {
    return this.prisma.$transaction(async (tx) => {
      let itemsToOrder: Array<{ productId: number; quantity: number }> = [];
      let isFromCart = false;

      if (dto.items && dto.items.length > 0) {
        itemsToOrder = dto.items;
      } else {
        const cart = await tx.cart.findUnique({
          where: { userId },
          include: { items: true },
        });

        if (!cart || cart.items.length === 0) {
          throw new BadRequestException('Your shopping cart is empty');
        }

        itemsToOrder = cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        }));
        isFromCart = true;
      }

      let totalAmount = 0;
      const orderItemsData: Array<{
        productId: number;
        quantity: number;
        price: number;
      }> = [];

      for (const item of itemsToOrder) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundException(`Product with ID ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`,
          );
        }

        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        const itemSubtotal = item.quantity * product.price;
        totalAmount += itemSubtotal;

        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
        });
      }

      const order = await tx.order.create({
        data: {
          userId,
          totalAmount: Math.round(totalAmount * 100) / 100,
          shippingAddress: dto.shippingAddress,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
      });

      if (isFromCart) {
        const cart = await tx.cart.findUnique({ where: { userId } });
        if (cart) {
          await tx.cartItem.deleteMany({
            where: { cartId: cart.id },
          });
        }
      }

      return order;
    });
  }

  async getMyOrders(userId: number, pagination: PaginationDto) {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getMyOrder(userId: number, orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                price: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('You do not have permission to view this order');
    }

    return order;
  }

  async cancelOrder(userId: number, orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('You do not have permission to cancel this order');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        `Cannot cancel an order with status "${order.status}". Only PENDING orders can be cancelled.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      return tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
        },
        include: { items: true },
      });
    });
  }

  async getAllOrdersAdmin(pagination: PaginationDto, status?: OrderStatus) {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, name: true },
          },
          items: {
            include: {
              product: {
                select: { id: true, name: true },
              },
            },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateOrderStatusAdmin(orderId: number, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: dto.status,
        ...(dto.paymentStatus ? { paymentStatus: dto.paymentStatus } : {}),
      },
      include: {
        items: true,
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });
  }
}
