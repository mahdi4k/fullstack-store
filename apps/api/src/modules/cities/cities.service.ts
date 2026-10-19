import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';

/** Active cities for the city selector, ordered for the picker grid. */
@Injectable()
export class CitiesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.city.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        slug: true,
        name: true,
        active: true,
        sortOrder: true,
      },
    });
  }
}
