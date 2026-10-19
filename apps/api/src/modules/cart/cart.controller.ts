import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CartService } from './cart.service.js';
import { AddToCartDto } from './dto/add-to-cart.dto.js';
import { UpdateCartItemDto } from './dto/update-cart-item.dto.js';

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user cart with computed totals' })
  getCart(@CurrentUser('id') userId: number) {
    return this.cartService.getCart(userId);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add an item to the shopping cart' })
  addItem(
    @CurrentUser('id') userId: number,
    @Body() dto: AddToCartDto,
  ) {
    return this.cartService.addItem(userId, dto);
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Update cart item quantity' })
  updateItem(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(userId, id, dto);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove an item from the cart' })
  removeItem(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cartService.removeItem(userId, id);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear all items from the cart' })
  clearCart(@CurrentUser('id') userId: number) {
    return this.cartService.clearCart(userId);
  }
}
