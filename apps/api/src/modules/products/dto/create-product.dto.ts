import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Wireless Noise Canceling Headphones' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'wireless-noise-canceling-headphones' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({
    example: 'High-quality wireless headphones with active noise cancellation.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Sony' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ example: 199.99 })
  @IsNumber()
  @IsPositive()
  price!: number;

  @ApiPropertyOptional({ example: 15, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  discountPercent?: number;

  @ApiPropertyOptional({ example: 50, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ example: 'https://example.com/images/headphones.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 'PRODUCT', default: 'PRODUCT' })
  @IsOptional()
  @IsString()
  serviceType?: 'PRODUCT' | 'SERVICE_KIT';

  @ApiPropertyOptional({
    example: ['Pride', 'Peugeot 206', 'Samand'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  compatibleVehicles?: string[];

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  categoryId?: number;
}
