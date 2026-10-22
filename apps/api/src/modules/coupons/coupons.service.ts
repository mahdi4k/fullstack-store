import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CouponType } from '../../generated/prisma/client.js';
import {
  CreateCouponDto,
  UpdateCouponDto,
  ValidateCouponDto,
} from './dto/coupon.dto.js';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async findOne(id: number) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }
    return coupon;
  }

  create(dto: CreateCouponDto) {
    return this.prisma.coupon.create({
      data: {
        code: dto.code.trim().toUpperCase(),
        type: dto.type,
        value: dto.value,
        minSubtotal: dto.minSubtotal ?? 0,
        maxDiscount: dto.maxDiscount ?? null,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        usageLimit: dto.usageLimit ?? null,
        active: dto.active ?? true,
      },
    });
  }

  async update(id: number, dto: UpdateCouponDto) {
    await this.findOne(id);
    return this.prisma.coupon.update({
      where: { id },
      data: {
        ...(dto.type ? { type: dto.type } : {}),
        ...(dto.value !== undefined ? { value: dto.value } : {}),
        ...(dto.minSubtotal !== undefined ? { minSubtotal: dto.minSubtotal } : {}),
        ...(dto.maxDiscount !== undefined ? { maxDiscount: dto.maxDiscount } : {}),
        ...(dto.expiresAt !== undefined
          ? { expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null }
          : {}),
        ...(dto.usageLimit !== undefined ? { usageLimit: dto.usageLimit } : {}),
        ...(dto.active !== undefined ? { active: dto.active } : {}),
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    // Orders keep their snapshot via onDelete: SetNull — safe to delete.
    await this.prisma.coupon.delete({ where: { id } });
    return { deleted: true };
  }

  /**
   * Validate a code against a cart subtotal, for the checkout preview.
   * Throws a friendly (400) error with the reason so the UI can show it.
   */
  async validate(dto: ValidateCouponDto) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: dto.code.trim().toUpperCase() },
    });

    if (!coupon) throw new BadRequestException('کد تخفیف نامعتبر است');
    if (!coupon.active) throw new BadRequestException('این کد تخفیف غیرفعال است');
    if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('این کد تخفیف منقضی شده است');
    }
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('ظرفیت استفاده از این کد تخفیف تمام شده است');
    }
    if (dto.subtotal < coupon.minSubtotal) {
      throw new BadRequestException(
        `مبلغ سبد خرید باید حداقل ${coupon.minSubtotal} تومان باشد`,
      );
    }

    const discount = this.computeDiscount(coupon.type, coupon.value, dto.subtotal, coupon.maxDiscount);

    return {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount,
    };
  }

  /** The single place that turns a coupon into a Toman discount. */
  computeDiscount(
    type: CouponType,
    value: number,
    subtotal: number,
    maxDiscount: number | null | undefined
  ): number {
    let discount =
      type === CouponType.PERCENT ? Math.round((subtotal * value) / 100) : value;
    if (type === CouponType.PERCENT && maxDiscount) {
      discount = Math.min(discount, maxDiscount);
    }
    return Math.min(Math.max(discount, 0), subtotal);
  }
}
