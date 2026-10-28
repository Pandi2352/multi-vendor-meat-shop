import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  DisputeReason,
  DisputeStatus,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Role,
} from '#common/enums';
import { TokenService } from '#modules/auth';
import { UserRepository } from '#modules/users';
import { OrderRepository } from '#modules/orders';
import { DisputeRepository } from '#modules/disputes';
import { runVirudhunagarSeed } from '../src/database/seeds/seed.js';
import { createTestApp } from './helpers/create-test-app.js';
import { AppModule } from '../src/app.module.js';

const API = '/api/v1';

describe('Customer Support Tickets & Disputes (e2e)', () => {
  let app: NestExpressApplication;
  let customerToken: string;
  let customerId: string;
  let otherCustomerToken: string;
  let testOrderId: string;
  let createdTicketId: string;

  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    await runVirudhunagarSeed();
    app = await createTestApp({ imports: [AppModule] });

    const userRepo = app.get(UserRepository);
    const orderRepo = app.get(OrderRepository);
    const disputeRepo = app.get(DisputeRepository);
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

    // Find or create an order for the demo customer
    const customerOrders = await orderRepo.findMany({ customerId }, { limit: 1 });
    if (customerOrders.length > 0) {
      testOrderId = customerOrders[0]._id;
    } else {
      // Create a test order if none exists
      const newOrder = await orderRepo.create({
        orderNumber: 'TN-20261028-9999',
        customerId,
        shopId: '018f0000-0000-7000-8000-000000000001',
        items: [],
        totals: {
          subtotalPaise: 35000,
          deliveryFeePaise: 3000,
          packagingFeePaise: 1500,
          discountPaise: 0,
          totalPaise: 39500,
          totalWeightGrams: 1000,
        },
        deliveryAddress: {
          text: '15 Madurai Road',
          pincode: '626001',
          district: 'Virudhunagar',
          location: { lat: 9.568, lng: 77.9624 },
          label: 'Home',
        },
        status: OrderStatus.DELIVERED,
        payment: { method: PaymentMethod.COD, status: PaymentStatus.COD_COLLECTED },
      });
      testOrderId = newOrder._id;
    }

    // Clean any prior test disputes for this order
    const existing = await disputeRepo.findByOrderId(testOrderId);
    for (const d of existing) {
      await disputeRepo.softDelete(d._id);
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. GET /api/v1/tickets requires authentication', async () => {
    await http().get(`${API}/tickets`).expect(401);
  });

  it('2. POST /api/v1/tickets submits issue ticket for customer order', async () => {
    const res = await http()
      .post(`${API}/tickets`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        orderId: testOrderId,
        reason: DisputeReason.QUALITY_FRESHNESS,
        customerComments: 'Chicken was warm, ice pouch was completely melted on arrival',
        claimedAmountPaise: 35000,
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.ticketNumber).toMatch(/^TKT-/);
    expect(res.body.data.orderId).toBe(testOrderId);
    expect(res.body.data.status).toBe(DisputeStatus.OPEN);
    expect(res.body.data.claimedAmountPaise).toBe(35000);

    createdTicketId = res.body.data.id;
  });

  it('3. GET /api/v1/tickets lists customer tickets', async () => {
    const res = await http()
      .get(`${API}/tickets`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    const found = res.body.data.find((t: { id: string }) => t.id === createdTicketId);
    expect(found).toBeTruthy();
  });

  it('4. GET /api/v1/tickets/order/:orderId retrieves ticket for order', async () => {
    const res = await http()
      .get(`${API}/tickets/order/${testOrderId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(createdTicketId);
  });

  it('5. POST /api/v1/tickets rejects duplicate active ticket for same order', async () => {
    const res = await http()
      .post(`${API}/tickets`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        orderId: testOrderId,
        reason: DisputeReason.UNDERWEIGHT,
        customerComments: 'Another complaint',
        claimedAmountPaise: 10000,
      })
      .expect(409);

    expect(res.body.success).toBe(false);
  });

  it('6. GET /api/v1/tickets/:id rejects access from unauthorized user', async () => {
    await http()
      .get(`${API}/tickets/${createdTicketId}`)
      .set('Authorization', `Bearer ${otherCustomerToken}`)
      .expect(403);
  });
});
