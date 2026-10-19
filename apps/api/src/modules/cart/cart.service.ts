import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { AddToCartDto } from './dto/add-to-cart.dto.js';
import { UpdateCartItemDto } from './dto/update-cart-item.dto.js';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateCart(userId: number) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
                stock: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  imageUrl: true,
                  stock: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    }

    return cart;
  }

  async getCart(userId: number) {
    const cart = await this.getOrCreateCart(userId);

    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0,
    );

    return {
      id: cart.id,
      userId: cart.userId,
      items: cart.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        product: item.product,
        total: Math.round(item.quantity * item.product.price * 100) / 100,
      })),
      totalItems,
      subtotal: Math.round(subtotal * 100) / 100,
    };
  }

  async addItem(userId: number, dto: AddToCartDto) {
    const quantity = dto.quantity ?? 1;

    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${dto.productId} not found`);
    }

    if (product.stock < quantity) {
      throw new BadRequestException(
        `Insufficient stock for product "${product.name}". Available: ${product.stock}`,
      );
    }

    const cart = await this.getOrCreateCart(userId);

    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: dto.productId,
        },
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        throw new BadRequestException(
          `Cannot add ${quantity} more. Stock limit of ${product.stock} reached. Currently in cart: ${existingItem.quantity}`,
        );
      }

      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: dto.productId,
          quantity,
        },
      });
    }

    return this.getCart(userId);
  }

  async updateItem(userId: number, cartItemId: number, dto: UpdateCartItemDto) {
    const cart = await this.getOrCreateCart(userId);

    const item = await this.prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        cartId: cart.id,
      },
      include: {
        product: true,
      },
    });

    if (!item) {
      throw new NotFoundException(`Cart item with ID ${cartItemId} not found`);
    }

    if (item.product.stock < dto.quantity) {
      throw new BadRequestException(
        `Insufficient stock for product "${item.product.name}". Available: ${item.product.stock}`,
      );
    }

    await this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: dto.quantity },
    });

    return this.getCart(userId);
  }

  async removeItem(userId: number, cartItemId: number) {
    const cart = await this.getOrCreateCart(userId);

    const item = await this.prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        cartId: cart.id,
      },
    });

    if (!item) {
      throw new NotFoundException(`Cart item with ID ${cartItemId} not found`);
    }

    await this.prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return this.getCart(userId);
  }

  async clearCart(userId: number) {
    const cart = await this.getOrCreateCart(userId);

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return {
      message: 'Cart cleared successfully',
      items: [],
      totalItems: 0,
      subtotal: 0,
    };
  }
}
