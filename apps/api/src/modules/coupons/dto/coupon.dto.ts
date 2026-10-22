import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUppercase,
  Length,
  Max,
  Min,
} from 'class-validator';

export class CreateCouponDto {
  @ApiProperty({ example: 'NOWRUZ1400' })
  @IsString()
  @Length(3, 40)
  @IsUppercase({ message: 'coupon code must be uppercase' })
  code!: string;

  @ApiProperty({ enum: ['PERCENT', 'FIXED'], example: 'PERCENT' })
  @IsEnum({ PERCENT: 'PERCENT', FIXED: 'FIXED' } as Record<string, string>)
  type!: 'PERCENT' | 'FIXED';

  @ApiProperty({ example: 10, description: 'percent (PERCENT) or Toman amount (FIXED)' })
  @IsNumber()
  @IsPositive()
  value!: number;

  @ApiPropertyOptional({ example: 500000, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minSubtotal?: number;

  @ApiPropertyOptional({
    example: 200000,
    description: 'cap the discount for PERCENT coupons (Toman)',
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  maxDiscount?: number;

  @ApiPropertyOptional({ example: '2026-04-10T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string | null;

  @ApiPropertyOptional({ example: 100, description: 'null = unlimited uses' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  usageLimit?: number | null;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateCouponDto {
  @ApiPropertyOptional({ enum: ['PERCENT', 'FIXED'] })
  @IsOptional()
  @IsEnum({ PERCENT: 'PERCENT', FIXED: 'FIXED' } as Record<string, string>)
  type?: 'PERCENT' | 'FIXED';

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  value?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  minSubtotal?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  maxDiscount?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiresAt?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @IsPositive()
  usageLimit?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class ValidateCouponDto {
  @ApiProperty({ example: 'NOWRUZ1400' })
  @IsString()
  code!: string;

  @ApiProperty({
    example: 1200000,
    description: 'cart subtotal the discount is computed against',
  })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  subtotal!: number;
}
