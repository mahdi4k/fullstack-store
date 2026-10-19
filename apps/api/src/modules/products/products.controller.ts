import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Role } from '../../generated/prisma/client.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { ProductQueryDto } from './dto/product-query.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { ProductsService } from './products.service.js';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products with search, filters, and pagination (Public)' })
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  // NOTE: static segments must be declared before `:id` so "by-slug"
  // is not captured as an ID.
  @Get('by-slug/:slug')
  @ApiOperation({ summary: 'Get product details by slug with city-scoped pricing (Public)' })
  findBySlug(
    @Param('slug') slug: string,
    @Query('city') city?: string,
  ) {
    return this.productsService.findOneBySlug(slug, city);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product details by ID with category and reviews (Public)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new product (Admin only)' })
  create(@Body() body: CreateProductDto) {
    return this.productsService.create(body);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update an existing product (Admin only)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProductDto,
  ) {
    return this.productsService.update(id, body);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a product (Admin only)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
