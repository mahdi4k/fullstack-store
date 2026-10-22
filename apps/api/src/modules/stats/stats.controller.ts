import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../generated/prisma/client.js';
import { StatsService } from './stats.service.js';

@ApiTags('Stats (Admin)')
@ApiBearerAuth()
@Controller('stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  @ApiOperation({ summary: 'Dashboard overview stats (Admin only)' })
  getStats() {
    return this.statsService.getStats();
  }
}
