import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Role, CutType, PreparationOption, LedgerDirection, LedgerEntryType, PaymentMethod } from '#common/enums';
import { TokenService } from '#modules/auth';
import { UserRepository } from '#modules/users';
import { ShopRepository } from '#modules/shops';
import { CategoryRepository } from '#modules/categories';
import { InventoryBatchRepository } from '#modules/inventory';
import { LedgerEntryRepository, CommissionRepository } from '#modules/finance';
import { runVirudhunagarSeed } from '../../src/database/seeds/seed.js';
import { createTestApp } from '../helpers/create-test-app.js';
import { AppModule } from '../../src/app.module.js';

const API = '/api/v1';

describe('Marketplace Golden Path Flow (e2e)', () => {
  let app: NestExpressApplication;
  let adminToken: string;
  let customerToken: string;
  let courierToken: string;
  let courierId: string;
  let vendorToken: string;

  let vendorShopId: string;
  let vendorProductId: string;
  let orderId: string;
  let orderNumber: string;
  let deliveryTaskId: string;
  let plainOtp: string;

  const testPhone = `98420${Math.floor(10000 + Math.random() * 90000)}`;
  const testEmail = `vetrivel.${Date.now()}@sivakasimeat.in`;
  let invitationToken: string;

  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    // 1. Seed database with Virudhunagar district hubs & demo accounts
    await runVirudhunagarSeed();
    app = await createTestApp({ imports: [AppModule] });

    const userRepo = app.get(UserRepository);
    const tokenService = app.get(TokenService);

    // Admin account
    const admin = await userRepo.findByEmail('admin@virudhunagar-meats.in');
    expect(admin).toBeTruthy();
    adminToken = tokenService.signAccessToken({
      id: admin!._id,
      role: admin!.role,
      permissions: [],
    });

    // Customer account
    const customer = await userRepo.findByEmail('demo.customer@virudhunagar.in');
    expect(customer).toBeTruthy();
    customerToken = tokenService.signAccessToken({
      id: customer!._id,
      role: Role.CUSTOMER,
      permissions: [],
    });

    // Delivery Courier account (Selvam)
    const courier = await userRepo.findByEmail('delivery.selvam@virudhunagar-meats.in');
    expect(courier).toBeTruthy();
    courierId = courier!._id;
    courierToken = tokenService.signAccessToken({
      id: courierId,
      role: Role.DELIVERY_PARTNER,
      permissions: [],
    });
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('Step 1: Admin creates stall & provisions credentials', async () => {
    const res = await http()
      .post(`${API}/admin/vendors`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ownerName: 'A. Vetrivel',
        phone: testPhone,
        email: testEmail,
        shopName: 'Sivakasi Vetrivel Fresh Mutton Stall',
        shopNameTa: 'சிவகாசி வெற்றிவேல் பிரஷ் மட்டன்',
        fssaiNumber: '12426008000888',
        openingTime: '06:00',
        closingTime: '21:00',
        serviceRadiusKm: 12,
        address: {
          line1: '77, West Car Street, Near Mariamman Temple',
          locality: 'Car Street Bazaar',
          city: 'Sivakasi',
          district: 'Virudhunagar',
          pincode: '626123',
          location: { lat: 9.4533, lng: 77.8024 },
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeTruthy();
    expect(res.body.data.businessName).toBe('Sivakasi Vetrivel Fresh Mutton Stall');

    // Verify shop was created and linked
    expect(res.body.data.shop).toBeTruthy();
    vendorShopId = res.body.data.shop.id;
    expect(vendorShopId).toBeTruthy();

    // Verify invitation URL was provisioned with secure token
    expect(res.body.data.invitation).toBeTruthy();
    const inviteUrl: string = res.body.data.invitation.inviteUrl;
    expect(inviteUrl).toContain('/accept-invite?token=');

    const tokenMatch = inviteUrl.match(/token=([a-zA-Z0-9_-]+)/);
    expect(tokenMatch).toBeTruthy();
    invitationToken = tokenMatch![1];
  });

  it('Step 2: Vendor activates account, publishes product & sets 20 kg daily batch', async () => {
    // 2a. Verify invitation token endpoint
    const checkInviteRes = await http()
      .get(`${API}/auth/portal/invitations/${invitationToken}`);
    expect(checkInviteRes.status).toBe(200);
    expect(checkInviteRes.body.success).toBe(true);
    expect(checkInviteRes.body.data.email).toBe(testEmail);
    expect(checkInviteRes.body.data.role).toBe(Role.VENDOR_OWNER);

    // 2b. Accept invitation and set initial password
    const acceptRes = await http()
      .post(`${API}/auth/portal/invitations/accept`)
      .send({
        token: invitationToken,
        password: 'Password123!',
        name: 'A. Vetrivel',
      });

    expect(acceptRes.status).toBe(200);
    expect(acceptRes.body.success).toBe(true);
    expect(acceptRes.body.data.accessToken).toBeTruthy();
    expect(acceptRes.body.data.user.role).toBe(Role.VENDOR_OWNER);

    vendorToken = acceptRes.body.data.accessToken;

    // 2c. Fetch Mutton category
    const categoryRepo = app.get(CategoryRepository);
    const category = (await categoryRepo.findBySlug('goat-mutton')) || (await categoryRepo.findActiveList())[0];
    expect(category).toBeTruthy();

    // 2d. Vendor adds fresh cut to catalogue
    const productRes = await http()
      .post(`${API}/vendor/products`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({
        name: 'Sivakasi Tender Mutton Curry Cut (நாட்டு ஆட்டுக்கறி)',
        cutType: CutType.CURRY_CUT,
        categoryId: category._id,
        pricePerKgPaise: 86000, // ₹860 per kg in integer paise
        mrpPerKgPaise: 92000,
        minGrams: 500,
        allowedWeightsGrams: [500, 1000, 2000],
        allowedPreparation: [PreparationOption.CLEANED, PreparationOption.MEDIUM_PIECES],
        isFreshDaily: true,
        status: 'ACTIVE',
      });

    expect(productRes.status).toBe(201);
    expect(productRes.body.success).toBe(true);
    vendorProductId = productRes.body.data.id;
    expect(vendorProductId).toBeTruthy();

    // 2e. Vendor logs morning opening batch of 20 kg (20,000 grams)
    const stockRes = await http()
      .post(`${API}/vendor/inventory/opening`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({
        productId: vendorProductId,
        openingGrams: 20000,
        notes: 'Morning fresh dressed Sivakasi mutton batch',
      });

    expect(stockRes.status).toBe(201);
    expect(stockRes.body.success).toBe(true);
    expect(stockRes.body.data.availableGrams).toBe(20000);
    expect(stockRes.body.data.totalOpeningGrams).toBe(20000);
  });

  it('Step 3: Customer checks out with COD and selected sunrise slot', async () => {
    // 3a. Add 1 kg of fresh mutton to customer cart
    const cartRes = await http()
      .post(`${API}/cart/items`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        shopId: vendorShopId,
        productId: vendorProductId,
        grams: 1000,
        quantity: 1,
        clearPreviousShop: true,
      });

    expect(cartRes.status).toBe(201);
    expect(cartRes.body.success).toBe(true);
    expect(cartRes.body.data.shopId).toBe(vendorShopId);

    // 3b. Verify checkout quote
    const quoteRes = await http()
      .get(`${API}/checkout/quote?lat=9.4533&lng=77.8024`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(quoteRes.status).toBe(200);
    expect(quoteRes.body.data.totalWeightGrams).toBe(1000);
    expect(quoteRes.body.data.subtotalPaise).toBe(86000);

    // 3c. Place COD order with Sunrise slot (06:00 - 08:00)
    const today = new Date().toISOString().slice(0, 10);
    const orderRes = await http()
      .post(`${API}/orders`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        deliveryAddress: {
          text: '15, Kamaraj Road, Sivakasi Town',
          pincode: '626123',
          district: 'Virudhunagar',
          location: { lat: 9.4533, lng: 77.8024 },
          label: 'Home',
        },
        slot: {
          date: today,
          startTime: '06:00',
          endTime: '08:00',
        },
        paymentMethod: PaymentMethod.COD,
        customerNotes: 'Fresh mutton for Sunday morning cooking',
      });

    expect(orderRes.status).toBe(201);
    expect(orderRes.body.success).toBe(true);

    const order = orderRes.body.data;
    orderId = order.id;
    orderNumber = order.orderNumber;
    expect(order.status).toBe('PLACED');
    expect(order.payment.method).toBe('COD');
    expect(order.payment.status).toBe('COD_PENDING');

    // 3d. Verify 1,000g deducted from available stock (now 19,000g)
    const batchRepo = app.get(InventoryBatchRepository);
    const batch = await batchRepo.findByShopProductDate(vendorShopId, vendorProductId, today);
    expect(batch!.availableGrams).toBe(19000);
  });

  it('Step 4: Vendor accepts and records actual packed weight', async () => {
    // 4a. Vendor accepts order
    const acceptRes = await http()
      .patch(`${API}/vendor/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ status: 'ACCEPTED', reason: 'Fresh cut scheduled for sunrise delivery' });

    expect(acceptRes.status).toBe(200);
    expect(acceptRes.body.data.status).toBe('ACCEPTED');

    // 4b. Vendor starts preparation
    const prepRes = await http()
      .patch(`${API}/vendor/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ status: 'PREPARING', reason: 'Dressing and portioning meat pieces' });

    expect(prepRes.status).toBe(200);
    expect(prepRes.body.data.status).toBe('PREPARING');

    // 4c. Vendor packs and weighs order: records 1,020g actual packed weight
    const readyRes = await http()
      .patch(`${API}/vendor/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({
        status: 'READY',
        reason: 'Packed with food-grade chilled insulation',
        actualPackedWeights: { [vendorProductId]: 1020 },
      });

    expect(readyRes.status).toBe(200);
    expect(readyRes.body.data.status).toBe('READY');
    expect(readyRes.body.data.items[0].actualPackedGrams).toBe(1020);
  });

  it('Step 5: Courier verifies OTP and completes delivery', async () => {
    // 5a. Fetch delivery task and plain OTP
    const taskRes = await http()
      .get(`${API}/delivery/tasks/order/${orderId}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(taskRes.status).toBe(200);
    deliveryTaskId = taskRes.body.data.id;
    plainOtp = taskRes.body.data.otpPlain;
    expect(plainOtp).toMatch(/^\d{4}$/);

    // 5b. Operations assigns courier Selvam
    const assignRes = await http()
      .post(`${API}/admin/delivery/tasks/${deliveryTaskId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        partnerId: courierId,
        partnerName: 'Selvam Express Courier',
        partnerPhone: '+919842188888',
      });

    expect(assignRes.status).toBe(201);
    expect(assignRes.body.data.status).toBe('ASSIGNED');

    // 5c. Courier picks up parcel at stall counter
    const pickupRes = await http()
      .patch(`${API}/delivery/tasks/${deliveryTaskId}/pickup`)
      .set('Authorization', `Bearer ${courierToken}`);

    expect(pickupRes.status).toBe(200);
    expect(pickupRes.body.data.status).toBe('PICKED_UP');

    // 5d. Courier arrives at doorstep, inputs customer OTP, and confirms COD cash collection
    const deliverRes = await http()
      .post(`${API}/delivery/tasks/${deliveryTaskId}/deliver`)
      .set('Authorization', `Bearer ${courierToken}`)
      .send({
        otp: plainOtp,
        collectedCod: true,
      });

    expect(deliverRes.status).toBe(201);
    expect(deliverRes.body.data.status).toBe('DELIVERED');
    expect(deliverRes.body.data.codCollected).toBe(true);

    // 5e. Verify order status has transitioned to DELIVERED
    const finalOrderRes = await http()
      .get(`${API}/orders/${orderId}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(finalOrderRes.status).toBe(200);
    expect(finalOrderRes.body.data.status).toBe('DELIVERED');
    expect(finalOrderRes.body.data.payment.status).toBe('COD_COLLECTED');
  });

  it('Step 6: Double-entry ledger records 10% platform commission and vendor payable', async () => {
    // 6a. Check vendor finance summary
    const financeRes = await http()
      .get(`${API}/vendor/finance/summary`)
      .set('Authorization', `Bearer ${vendorToken}`);

    expect(financeRes.status).toBe(200);
    expect(financeRes.body.success).toBe(true);

    const summary = financeRes.body.data;
    // Total COD sales reflect the order
    expect(summary.totalGrossSalesPaise).toBeGreaterThan(0);
    // Platform commission (10%) deducted
    expect(summary.totalCommissionDeductedPaise).toBe(Math.round(summary.totalGrossSalesPaise * 0.1));
    // Vendor payable balance is gross minus commission
    expect(summary.payableBalancePaise).toBe(
      summary.totalGrossSalesPaise - summary.totalCommissionDeductedPaise,
    );

    // 6b. Verify double-entry ledger entries in database
    const ledgerRepo = app.get(LedgerEntryRepository);
    const entries = await ledgerRepo.findRecentByShop(vendorShopId);
    expect(entries.length).toBeGreaterThanOrEqual(1);

    const orderEntry = entries.find((e) => e.referenceId === orderNumber);
    expect(orderEntry).toBeTruthy();
    expect(orderEntry!.amountPaise).toBe(summary.payableBalancePaise);
    expect(orderEntry!.direction).toBe(LedgerDirection.CREDIT);
    expect(orderEntry!.entryType).toBe(LedgerEntryType.SALE);

    // 6c. Verify platform commission record (10%)
    const commissionRepo = app.get(CommissionRepository);
    const commission = await commissionRepo.findByOrderId(orderId);
    expect(commission).toBeTruthy();
    expect(commission!.commissionBps).toBe(1000); // 10%
    expect(commission!.commissionAmountPaise).toBe(summary.totalCommissionDeductedPaise);
    expect(commission!.netVendorAmountPaise).toBe(summary.payableBalancePaise);
  });
});
