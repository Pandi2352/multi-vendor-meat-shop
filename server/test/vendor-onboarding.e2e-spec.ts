import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Role, ShopStatus, VendorVerificationStatus } from '#common/enums';
import { TokenService } from '#modules/auth';
import { UserRepository } from '#modules/users';
import { ShopRepository } from '#modules/shops';
import { runVirudhunagarSeed } from '../src/database/seeds/seed.js';
import { createTestApp } from './helpers/create-test-app.js';
import { AppModule } from '../src/app.module.js';

const API = '/api/v1';

describe('Vendor Onboarding & Admin Management (e2e)', () => {
  let app: NestExpressApplication;
  let adminToken: string;
  let adminId: string;
  let publicApplicationId: string;
  let publicShopId: string;

  const testPhone = `98420${Math.floor(10000 + Math.random() * 90000)}`;
  const testEmail = `murugan.${Date.now()}@virudhunagar-vendor.in`;

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
    adminId = admin!._id;

    adminToken = tokenService.signAccessToken({
      id: adminId,
      role: Role.ADMIN,
      permissions: ['*'],
    });
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('Step 1: Public prospective vendor submits shop application from public storefront', async () => {
    const res = await http()
      .post(`${API}/vendors/apply`)
      .send({
        ownerName: 'K. Murugan',
        businessName: 'Sattur Highway Chicken & Mutton',
        phone: testPhone,
        email: testEmail,
        town: 'Sattur',
        locality: 'Main Bazaar',
        addressLine: '10 Kovilpatti Road, Near Bus Stand',
        pincode: '626203',
        fssaiNumber: '12426008000999',
        categoriesOffered: ['Broiler Chicken', 'Country Chicken (நாட்டுக்கோழி)', 'Goat Mutton (ஆட்டுக்கறி)'],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.applicationId).toBeTruthy();
    expect(res.body.data.status).toBe(VendorVerificationStatus.SUBMITTED);
    expect(res.body.data.shopId).toBeTruthy();

    publicApplicationId = res.body.data.applicationId;
    publicShopId = res.body.data.shopId;

    const shopRepo = app.get(ShopRepository);
    const shop = await shopRepo.findByIdOrThrow(publicShopId);
    expect(shop.status).toBe(ShopStatus.CLOSED); // Unapproved shops remain closed
    expect(shop.address.city).toBe('Sattur');
    expect(shop.address.pincode).toBe('626203');
  });

  it('Step 2: Admin lists vendor applications and sees the new public application with stall details', async () => {
    const res = await http()
      .get(`${API}/admin/vendors`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const list = Array.isArray(res.body.data) ? res.body.data : res.body.data.items;
    const found = list.find((v: { id: string }) => v.id === publicApplicationId);
    expect(found).toBeTruthy();
    expect(found.businessName).toBe('Sattur Highway Chicken & Mutton');
    expect(found.ownerName).toBe('K. Murugan');
    expect(found.status).toBe(VendorVerificationStatus.SUBMITTED);
    expect(found.shop).toBeTruthy();
    expect(found.shop.city).toBe('Sattur');
  });

  it('Step 3: Admin reviews and approves the public application, activating the stall', async () => {
    const res = await http()
      .patch(`${API}/admin/vendors/${publicApplicationId}/verify`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: VendorVerificationStatus.APPROVED,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe(VendorVerificationStatus.APPROVED);

    // Verify shop status is now OPEN
    const shopRepo = app.get(ShopRepository);
    const shop = await shopRepo.findByIdOrThrow(publicShopId);
    expect(shop.status).toBe(ShopStatus.OPEN);
  });

  it('Step 4: Admin directly creates and activates a new vendor and butcher stall', async () => {
    const res = await http()
      .post(`${API}/admin/vendors`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ownerName: 'M. Pandian',
        phone: `98420${Math.floor(10000 + Math.random() * 90000)}`,
        email: `pandian.${Date.now()}@virudhunagar.in`,
        shopName: 'Rajapalayam Quail & Country Hub',
        fssaiNumber: '12426008000777',
        address: {
          line1: '45 Tenkasi Main Road',
          locality: 'Near PACR Salai',
          city: 'Rajapalayam',
          district: 'Virudhunagar',
          pincode: '626117',
        },
        openingTime: '06:00',
        closingTime: '21:30',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe(VendorVerificationStatus.APPROVED);
    expect(res.body.data.businessName).toBe('Rajapalayam Quail & Country Hub');
    expect(res.body.data.shop).toBeTruthy();
    expect(res.body.data.shop.city).toBe('Rajapalayam');
    expect(res.body.data.shop.status).toBe(ShopStatus.OPEN);
  });
});
