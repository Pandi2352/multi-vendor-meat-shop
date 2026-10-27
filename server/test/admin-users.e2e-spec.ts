import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Role, UserStatus } from '#common/enums';
import { TokenService } from '#modules/auth';
import { UserRepository } from '#modules/users';
import { runVirudhunagarSeed } from '../src/database/seeds/seed.js';
import { createTestApp } from './helpers/create-test-app.js';
import { AppModule } from '../src/app.module.js';

const API = '/api/v1';

describe('Admin User Management & RBAC Permissions (e2e)', () => {
  let app: NestExpressApplication;
  let adminToken: string;
  let customerId: string;
  let createdInviteId: string;

  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    await runVirudhunagarSeed();
    app = await createTestApp({ imports: [AppModule] });

    const userRepo = app.get(UserRepository);
    const tokenService = app.get(TokenService);

    const admin =
      (await userRepo.findByEmail('admin@virudhunagar-meats.in')) ||
      (await userRepo.findOne({ role: Role.SUPER_ADMIN }));
    expect(admin).toBeTruthy();

    adminToken = tokenService.signAccessToken({
      id: admin!._id,
      role: Role.SUPER_ADMIN,
      permissions: [],
    });

    // A throwaway account: this suite changes its role and status, so it must never be a shared
    // seeded user (other suites sign in as the demo customer).
    const customer = await userRepo.create({
      email: `customer.${Date.now()}@test.in`,
      phone: '9842011111',
      name: 'Test Customer',
      role: Role.CUSTOMER,
      status: UserStatus.ACTIVE,
      shopId: null,
      deletedAt: null,
      deletedBy: null,
    });
    expect(customer).toBeTruthy();
    customerId = customer!._id;
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('Step 1: Admin lists all registered users with pagination and search', async () => {
    const res = await http()
      .get(`${API}/admin/users?page=1&limit=10`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.meta).toHaveProperty('total');
  });

  it('Step 2: Admin assigns a new role to an existing user', async () => {
    const res = await http()
      .patch(`${API}/admin/users/${customerId}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: Role.OPERATIONS });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe(Role.OPERATIONS);
  });

  it('Step 3: Admin updates user status (e.g. SUSPENDED and back to ACTIVE)', async () => {
    const suspendRes = await http()
      .patch(`${API}/admin/users/${customerId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: UserStatus.SUSPENDED });

    expect(suspendRes.status).toBe(200);
    expect(suspendRes.body.data.status).toBe(UserStatus.SUSPENDED);

    const activateRes = await http()
      .patch(`${API}/admin/users/${customerId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: UserStatus.ACTIVE });

    expect(activateRes.status).toBe(200);
    expect(activateRes.body.data.status).toBe(UserStatus.ACTIVE);
  });

  it('Step 4: Admin invites a new user with role and email', async () => {
    const inviteEmail = `invitee.${Date.now()}@virudhunagar-delivery.in`;
    const res = await http()
      .post(`${API}/admin/users/invitations`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: inviteEmail,
        name: 'Ganesan Delivery',
        role: Role.DELIVERY_PARTNER,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(inviteEmail);
    expect(res.body.data.role).toBe(Role.DELIVERY_PARTNER);
    expect(res.body.data.status).toBe('PENDING');

    createdInviteId = res.body.data.id;
  });

  it('Step 5: Admin lists pending invitations and resends invitation email', async () => {
    const listRes = await http()
      .get(`${API}/admin/users/invitations`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.data)).toBe(true);
    expect(listRes.body.data.some((i: { id: string }) => i.id === createdInviteId)).toBe(true);

    const resendRes = await http()
      .post(`${API}/admin/users/invitations/${createdInviteId}/resend`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(resendRes.status).toBe(200);
    expect(resendRes.body.data.id).toBe(createdInviteId);
  });

  it('Step 6: Admin revokes an invitation', async () => {
    const revokeRes = await http()
      .delete(`${API}/admin/users/invitations/${createdInviteId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(revokeRes.status).toBe(200);
    expect(revokeRes.body.data.success).toBe(true);
  });

  it('Step 7: Admin lists all roles with their configured permissions', async () => {
    const res = await http()
      .get(`${API}/admin/roles`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    const operationsRole = res.body.data.find((r: { role: string }) => r.role === Role.OPERATIONS);
    expect(operationsRole).toBeDefined();
    expect(Array.isArray(operationsRole.permissions)).toBe(true);
  });

  it('Step 8: Admin customizes permissions mapped to a role', async () => {
    const newPermissions = ['user.read', 'vendor.read', 'shop.manage'];
    const res = await http()
      .put(`${API}/admin/roles/${Role.OPERATIONS}/permissions`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ permissions: newPermissions });

    expect(res.status).toBe(200);
    expect(res.body.data.role).toBe(Role.OPERATIONS);
    expect(res.body.data.permissions).toEqual(expect.arrayContaining(newPermissions));
  });
});
