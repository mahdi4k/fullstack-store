import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';

describe('Store E2E Flow', () => {
  let app: INestApplication;
  let customerToken: string;
  let adminToken: string;
  let productId: number;
  let orderId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. Login with seeded admin and customer accounts', async () => {
    const adminRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@store.com', password: 'admin123' })
      .expect(200);

    expect(adminRes.body.accessToken).toBeDefined();
    expect(adminRes.body.user.role).toBe('ADMIN');
    adminToken = adminRes.body.accessToken;

    const customerRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'customer@store.com', password: 'customer123' })
      .expect(200);

    expect(customerRes.body.accessToken).toBeDefined();
    expect(customerRes.body.user.role).toBe('CUSTOMER');
    customerToken = customerRes.body.accessToken;
  });

  it('2. List categories', async () => {
    const res = await request(app.getHttpServer())
      .get('/categories')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('3. List and filter products', async () => {
    const res = await request(app.getHttpServer())
      .get('/products?page=1&limit=5&sortBy=price&sortOrder=asc')
      .expect(200);

    expect(res.body.data).toBeDefined();
    expect(res.body.meta).toBeDefined();
    expect(res.body.data.length).toBeGreaterThan(0);
    productId = res.body.data[0].id;
  });

  it('4. Get product detail with reviews and rating', async () => {
    const res = await request(app.getHttpServer())
      .get(`/products/${productId}`)
      .expect(200);

    expect(res.body.id).toBe(productId);
    expect(res.body.name).toBeDefined();
  });

  it('5. Add product to cart, get cart, and verify total', async () => {
    await request(app.getHttpServer())
      .post('/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId, quantity: 2 })
      .expect(201);

    const cartRes = await request(app.getHttpServer())
      .get('/cart')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    expect(cartRes.body.items.length).toBeGreaterThan(0);
    expect(cartRes.body.subtotal).toBeGreaterThan(0);
  });

  it('6. Checkout cart into an order', async () => {
    const res = await request(app.getHttpServer())
      .post('/orders/checkout')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ shippingAddress: '742 Evergreen Terrace, Springfield' })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.status).toBe('PENDING');
    expect(res.body.totalAmount).toBeGreaterThan(0);
    orderId = res.body.id;

    // Cart should now be empty
    const cartRes = await request(app.getHttpServer())
      .get('/cart')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    expect(cartRes.body.items.length).toBe(0);
  });

  it('7. View customer order history and order detail', async () => {
    const res = await request(app.getHttpServer())
      .get('/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    expect(res.body.data.some((o: any) => o.id === orderId)).toBe(true);

    const detailRes = await request(app.getHttpServer())
      .get(`/orders/${orderId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    expect(detailRes.body.id).toBe(orderId);
  });

  it('8. Leave a product review', async () => {
    const res = await request(app.getHttpServer())
      .post(`/products/${productId}/reviews`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ rating: 4, comment: 'Great product, arrived quickly!' })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.rating).toBe(4);
  });

  it('9. Admin views all orders and updates status to PROCESSING and PAID', async () => {
    const ordersRes = await request(app.getHttpServer())
      .get('/orders/admin/all')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(ordersRes.body.data.length).toBeGreaterThan(0);

    const updateRes = await request(app.getHttpServer())
      .patch(`/orders/admin/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'PROCESSING', paymentStatus: 'PAID' })
      .expect(200);

    expect(updateRes.body.status).toBe('PROCESSING');
    expect(updateRes.body.paymentStatus).toBe('PAID');
  });
});
