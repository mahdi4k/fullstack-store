import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsPositive, IsString, ValidateNested } from 'class-validator';

export class CheckoutItemDto {
  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsPositive()
  productId!: number;

  @ApiPropertyOptional({ example: 2, default: 1 })
  @IsInt()
  @IsPositive()
  quantity!: number;
}

export class CheckoutDto {
  @ApiPropertyOptional({ example: '123 Tech Street, Suite 400, New York, NY' })
  @IsOptional()
  @IsString()
  shippingAddress?: string;

  @ApiPropertyOptional({
    description: 'Optional direct items to checkout ("Buy Now"). If omitted, cart items are used.',
    type: [CheckoutItemDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items?: CheckoutItemDto[];

  @ApiPropertyOptional({
    description: 'Optional discount code to apply to the order total.',
    example: 'NOWRUZ1400',
  })
  @IsOptional()
  @IsString()
  couponCode?: string;
}
