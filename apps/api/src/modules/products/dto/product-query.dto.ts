import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto.js';

export enum ProductSortBy {
  CREATED_AT = 'createdAt',
  PRICE = 'price',
  NAME = 'name',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum ProductTypeFilter {
  PRODUCT = 'PRODUCT',
  SERVICE_KIT = 'SERVICE_KIT',
}

export class ProductQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Search keyword for name or description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by category ID' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number;

  @ApiPropertyOptional({ description: 'Filter by category slug, e.g. oils-lubricants' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'City slug for scoped pricing/stock, e.g. isfahan' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Filter by compatible vehicle name, e.g. "Pride"' })
  @IsOptional()
  @IsString()
  vehicle?: string;

  @ApiPropertyOptional({ enum: ProductTypeFilter, description: 'PRODUCT vs SERVICE_KIT' })
  @IsOptional()
  @IsEnum(ProductTypeFilter)
  type?: ProductTypeFilter;

  @ApiPropertyOptional({ description: 'Filter by brand' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ description: 'Filter by minimum price' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Filter by maximum price' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Filter only products in stock' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  inStock?: boolean;

  @ApiPropertyOptional({ enum: ProductSortBy, default: ProductSortBy.CREATED_AT })
  @IsOptional()
  @IsEnum(ProductSortBy)
  sortBy?: ProductSortBy = ProductSortBy.CREATED_AT;

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
