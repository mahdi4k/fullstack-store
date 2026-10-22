import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './database/prisma.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { CategoriesModule } from './modules/categories/categories.module.js';
import { CitiesModule } from './modules/cities/cities.module.js';
import { CartModule } from './modules/cart/cart.module.js';
import { CouponsModule } from './modules/coupons/coupons.module.js';
import { OrdersModule } from './modules/orders/orders.module.js';
import { ProductsModule } from './modules/products/products.module.js';
import { ReviewsModule } from './modules/reviews/reviews.module.js';
import { StatsModule } from './modules/stats/stats.module.js';
import { StorefrontModule } from './modules/storefront/storefront.module.js';
import { UsersModule } from './modules/users/users.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CitiesModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    ReviewsModule,
    StorefrontModule,
    CouponsModule,
    StatsModule,
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY || 'YOUR_APP_KEY',
      appSecret: process.env.OBSERVE_APP_SECRET || 'YOUR_APP_SECRET',
      serviceId: 'api',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
