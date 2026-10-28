import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Role } from '#common/enums';
import { TokenService } from '#modules/auth';
import { UserRepository } from '#modules/users';
import { runVirudhunagarSeed } from '../src/database/seeds/seed.js';
import { createTestApp } from './helpers/create-test-app.js';
import { AppModule } from '../src/app.module.js';

const API = '/api/v1';

describe('Coupons and Promo Codes (e2e)', () => {
  let app: NestExpressApplication;
  let customerToken: string;
  let customerId: string;

  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    await runVirudhunagarSeed();
    app = await createTestApp({ imports: [AppModule] });

    const userRepo = app.get(UserRepository);
    const tokenService = app.get(TokenService);

    const customer = await userRepo.findByEmail('demo.customer@virudhunagar.in');
    expect(customer).toBeTruthy();
    customerId = customer!._id;

    customerToken = tokenService.signAccessToken({
      id: customerId,
      role: Role.CUSTOMER,
      permissions: [],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. GET /api/v1/coupons/available returns active promo coupons', async () => {
    const res = await http().get(`${API}/coupons/available`).expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);

    const codes = res.body.data.map((c: { code: string }) => c.code);
    expect(codes).toContain('FIRSTMEAT50');
    expect(codes).toContain('VIRUDHUNAGAR20');
  });

  it('2. POST /api/v1/coupons/apply requires authentication', async () => {
    await http()
      .post(`${API}/coupons/apply`)
      .send({
        code: 'FIRSTMEAT50',
        subtotalPaise: 25000,
      })
      .expect(401);
  });

  it('3. POST /api/v1/coupons/apply successfully validates and calculates discount', async () => {
    const res = await http()
      .post(`${API}/coupons/apply`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        code: 'FIRSTMEAT50',
        subtotalPaise: 25000,
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.code).toBe('FIRSTMEAT50');
    expect(res.body.data.discountPaise).toBe(5000);
    expect(res.body.data.subtotalPaise).toBe(25000);
    expect(res.body.data.newTotalPaise).toBe(20000);
  });

  it('4. POST /api/v1/coupons/apply rejects when order subtotal is below minimum order requirement', async () => {
    const res = await http()
      .post(`${API}/coupons/apply`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        code: 'FIRSTMEAT50',
        subtotalPaise: 10000, // below 20000 minimum
      })
      .expect(422);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('MIN_ORDER_NOT_MET');
  });

  it('5. POST /api/v1/coupons/apply rejects nonexistent code', async () => {
    const res = await http()
      .post(`${API}/coupons/apply`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        code: 'INVALIDCODE123',
        subtotalPaise: 25000,
      })
      .expect(422);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('COUPON_INVALID');
  });
});
