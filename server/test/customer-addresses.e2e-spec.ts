import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Role } from '#common/enums';
import { TokenService } from '#modules/auth';
import { UserRepository, AddressRepository } from '#modules/users';
import { runVirudhunagarSeed } from '../src/database/seeds/seed.js';
import { createTestApp } from './helpers/create-test-app.js';
import { AppModule } from '../src/app.module.js';

const API = '/api/v1';

describe('Customer Addresses Management (e2e)', () => {
  let app: NestExpressApplication;
  let customerToken: string;
  let customerId: string;
  let otherCustomerToken: string;
  let firstAddressId: string;
  let secondAddressId: string;

  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    await runVirudhunagarSeed();
    app = await createTestApp({ imports: [AppModule] });

    const userRepo = app.get(UserRepository);
    const addressRepo = app.get(AddressRepository);
    const tokenService = app.get(TokenService);

    const customer = await userRepo.findByEmail('demo.customer@virudhunagar.in');
    expect(customer).toBeTruthy();
    customerId = customer!._id;

    // Clean existing test addresses for demo customer so tests are deterministic
    const existing = await addressRepo.findByUserId(customerId);
    for (const addr of existing) {
      await addressRepo.deleteById(addr._id);
    }

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
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. creates first delivery address and automatically marks it as default', async () => {
    const res = await http()
      .post(`${API}/users/me/addresses`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        label: 'HOME',
        text: '12 Madurai Road, Near Clock Tower',
        pincode: '626001',
        district: 'Virudhunagar',
        lat: 9.568,
        lng: 77.9624,
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.label).toBe('HOME');
    expect(res.body.data.isDefault).toBe(true);
    expect(res.body.data.pincode).toBe('626001');
    firstAddressId = res.body.data.id;
  });

  it('2. creates second address as default, automatically unsetting default on first', async () => {
    const res = await http()
      .post(`${API}/users/me/addresses`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        label: 'WORK',
        text: '45 Sivakasi Main Road, Industrial Estate',
        pincode: '626123',
        district: 'Virudhunagar',
        isDefault: true,
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.label).toBe('WORK');
    expect(res.body.data.isDefault).toBe(true);
    secondAddressId = res.body.data.id;

    // Verify first address is no longer default
    const listRes = await http()
      .get(`${API}/users/me/addresses`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    const first = listRes.body.data.find((a: { id: string }) => a.id === firstAddressId);
    expect(first.isDefault).toBe(false);
  });

  it('3. updates an existing saved address', async () => {
    const updateRes = await http()
      .patch(`${API}/users/me/addresses/${firstAddressId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        text: '12 Madurai Road, Near Clock Tower, 2nd Floor',
      })
      .expect(200);

    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.data.text).toBe('12 Madurai Road, Near Clock Tower, 2nd Floor');
  });

  it('4. sets first address back as primary default', async () => {
    const defaultRes = await http()
      .patch(`${API}/users/me/addresses/${firstAddressId}/default`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    expect(defaultRes.body.success).toBe(true);
    expect(defaultRes.body.data.isDefault).toBe(true);
  });

  it('5. forbids updating or deleting another customer address', async () => {
    await http()
      .patch(`${API}/users/me/addresses/${firstAddressId}`)
      .set('Authorization', `Bearer ${otherCustomerToken}`)
      .send({ text: 'Malicious modification' })
      .expect(403);

    await http()
      .delete(`${API}/users/me/addresses/${firstAddressId}`)
      .set('Authorization', `Bearer ${otherCustomerToken}`)
      .expect(403);
  });

  it('6. deletes saved address successfully', async () => {
    await http()
      .delete(`${API}/users/me/addresses/${secondAddressId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    const listRes = await http()
      .get(`${API}/users/me/addresses`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    expect(listRes.body.data.some((a: { id: string }) => a.id === secondAddressId)).toBe(false);
  });
});
