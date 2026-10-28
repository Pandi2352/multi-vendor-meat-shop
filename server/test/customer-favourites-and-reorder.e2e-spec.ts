import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Role,
} from '#common/enums';
import { TokenService } from '#modules/auth';
import { UserRepository } from '#modules/users';
import { OrderRepository } from '#modules/orders';
import { ProductRepository } from '#modules/products';
import { runVirudhunagarSeed } from '../src/database/seeds/seed.js';
import { createTestApp } from './helpers/create-test-app.js';
import { AppModule } from '../src/app.module.js';

const API = '/api/v1';

describe('Customer Favourites & 1-Click Reorder (e2e)', () => {
  let app: NestExpressApplication;
  let customerToken: string;
  let customerId: string;
  let otherCustomerToken: string;
  let testProductId: string;
  let testOrderId: string;

  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    await runVirudhunagarSeed();
    app = await createTestApp({ imports: [AppModule] });

    const userRepo = app.get(UserRepository);
    const orderRepo = app.get(OrderRepository);
    const productRepo = app.get(ProductRepository);
    const tokenService = app.get(TokenService);

    const customer = await userRepo.findByEmail('demo.customer@virudhunagar.in');
    expect(customer).toBeTruthy();
    customerId = customer!._id;

    customerToken = tokenService.signAccessToken({
      id: customerId,
      role: Role.CUSTOMER,
      permissions: [],
    });

    const otherUser = await userRepo.findByEmail('murugesan.ops@virudhunagar-meats.in');
    expect(otherUser).toBeTruthy();
    otherCustomerToken = tokenService.signAccessToken({
      id: otherUser!._id,
      role: otherUser!.role,
      permissions: [],
    });

    const products = await productRepo.findMany({}, { limit: 1 });
    expect(products.length).toBeGreaterThan(0);
    testProductId = products[0]._id;

    // Create a delivered order for reorder test
    const order = await orderRepo.create({
      orderNumber: `ORD-REORDER-${Date.now().toString(36).toUpperCase()}`,
      customerId,
      shopId: products[0].shopId,
      items: [
        {
          productId: products[0]._id,
          name: products[0].name,
          grams: 500,
          quantity: 1,
          pricePerKgPaise: products[0].pricePerKgPaise,
          lineTotalPaise: Math.round((products[0].pricePerKgPaise * 500) / 1000),
          cutType: products[0].cutType,
          preparation: 'CLEANED' as any,
        },
      ],
      totals: {
        subtotalPaise: Math.round((products[0].pricePerKgPaise * 500) / 1000),
        deliveryFeePaise: 4000,
        packagingFeePaise: 1500,
        discountPaise: 0,
        totalPaise: Math.round((products[0].pricePerKgPaise * 500) / 1000) + 5500,
        totalWeightGrams: 500,
      },
      deliveryAddress: {
        text: '12 Railway Feeder Road',
        pincode: '626001',
        district: 'Virudhunagar',
        location: { lat: 9.5872, lng: 77.9576 },
        label: 'HOME',
      },
      status: OrderStatus.DELIVERED,
      payment: {
        method: PaymentMethod.COD,
        status: PaymentStatus.COD_COLLECTED,
      },
    });
    testOrderId = order._id;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('1. GET /favourites/ids returns empty or existing list', async () => {
    const res = await http()
      .get(`${API}/favourites/ids`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('2. POST /favourites/:productId/toggle toggles favourite status on', async () => {
    const res = await http()
      .post(`${API}/favourites/${testProductId}/toggle`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    expect(res.body.data.isFavourited).toBe(true);
    expect(res.body.data.productId).toBe(testProductId);
  });

  it('3. GET /favourites/ids returns testProductId in array', async () => {
    const res = await http()
      .get(`${API}/favourites/ids`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    expect(res.body.data).toContain(testProductId);
  });

  it('4. GET /favourites returns enriched meat cuts with stall name and live stock', async () => {
    const res = await http()
      .get(`${API}/favourites`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    expect(res.body.data.length).toBeGreaterThan(0);
    const item = res.body.data.find((f: any) => f.productId === testProductId);
    expect(item).toBeTruthy();
    expect(item.productName).toBeTruthy();
    expect(item.shopName).toBeTruthy();
    expect(item.pricePerKgPaise).toBeGreaterThan(0);
  });

  it('5. POST /favourites/:productId/toggle toggles favourite status off', async () => {
    const res = await http()
      .post(`${API}/favourites/${testProductId}/toggle`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    expect(res.body.data.isFavourited).toBe(false);
  });

  it('6. POST /orders/:id/reorder populates customer cart from delivered past order', async () => {
    const res = await http()
      .post(`${API}/orders/${testOrderId}/reorder`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    expect(res.body.data.success).toBe(true);
    expect(res.body.data.itemsAdded).toBe(1);
    expect(res.body.data.cart).toBeTruthy();
    expect(res.body.data.cart.items.length).toBeGreaterThan(0);
  });

  it('7. POST /orders/:id/reorder rejects unauthorized reorder attempt (403)', async () => {
    await http()
      .post(`${API}/orders/${testOrderId}/reorder`)
      .set('Authorization', `Bearer ${otherCustomerToken}`)
      .expect(403);
  });
});
