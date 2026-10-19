import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { ReviewsService } from './reviews.service.js';

@ApiTags('Reviews')
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('products/:productId/reviews')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Submit a review and rating (1-5) for a product' })
  create(
    @CurrentUser('id') userId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(userId, productId, dto);
  }

  @Get('products/:productId/reviews')
  @ApiOperation({ summary: 'Get all reviews for a specific product (Public)' })
  findByProduct(
    @Param('productId', ParseIntPipe) productId: number,
    @Query() pagination: PaginationDto,
  ) {
    return this.reviewsService.findByProduct(productId, pagination);
  }

  @Delete('reviews/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a review (Author or Admin)' })
  remove(
    @CurrentUser('id') userId: number,
    @CurrentUser('role') role: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.reviewsService.remove(userId, id, role);
  }
}
