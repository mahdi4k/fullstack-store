import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { OrderStatus, Role } from '../../generated/prisma/client.js';
import { CheckoutDto } from './dto/checkout.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { OrdersService } from './orders.service.js';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Create an order from cart or direct items' })
  checkout(
    @CurrentUser('id') userId: number,
    @Body() dto: CheckoutDto,
  ) {
    return this.ordersService.checkout(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get current user order history' })
  getMyOrders(
    @CurrentUser('id') userId: number,
    @Query() pagination: PaginationDto,
  ) {
    return this.ordersService.getMyOrders(userId, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific user order' })
  getMyOrder(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ordersService.getMyOrder(userId, id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a pending order and restore inventory' })
  cancelOrder(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ordersService.cancelOrder(userId, id);
  }

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all orders across all users (Admin only)' })
  @ApiQuery({ name: 'status', enum: OrderStatus, required: false })
  getAllOrdersAdmin(
    @Query() pagination: PaginationDto,
    @Query('status') status?: OrderStatus,
  ) {
    return this.ordersService.getAllOrdersAdmin(pagination, status);
  }

  @Patch('admin/:id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update order and payment status (Admin only)' })
  updateOrderStatusAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatusAdmin(id, dto);
  }
}
