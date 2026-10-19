import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CitiesService } from './cities.service.js';

@ApiTags('Cities')
@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  /** List active cities with slugs and Persian names. */
  @Get()
  findAll() {
    return this.citiesService.findAll();
  }
}
