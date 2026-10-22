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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../generated/prisma/client.js';
import { CouponsService } from './coupons.service.js';
import {
  CreateCouponDto,
  UpdateCouponDto,
  ValidateCouponDto,
} from './dto/coupon.dto.js';

@ApiTags('Coupons')
@Controller('coupons')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  /** Preview a coupon's discount for a cart subtotal (any signed-in user). */
  @Post('validate')
  @ApiOperation({ summary: 'Validate a discount code against a subtotal' })
  validate(@Body() dto: ValidateCouponDto) {
    return this.couponsService.validate(dto);
  }

  // ---- Admin CRUD ----

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List coupons (Admin only)' })
  findAll() {
    return this.couponsService.findAll();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a coupon (Admin only)' })
  create(@Body() dto: CreateCouponDto) {
    return this.couponsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a coupon (Admin only)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCouponDto) {
    return this.couponsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a coupon (Admin only)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.couponsService.remove(id);
  }
}
