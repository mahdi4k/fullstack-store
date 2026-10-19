import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StorefrontService } from './storefront.service.js';

@ApiTags('Storefront')
@Controller('storefront')
export class StorefrontController {
  constructor(private readonly storefrontService: StorefrontService) {}

  /** Aggregated homepage payload for one city. */
  @Get(':citySlug')
  getCityStorefront(@Param('citySlug') citySlug: string) {
    return this.storefrontService.getCityStorefront(citySlug);
  }
}
