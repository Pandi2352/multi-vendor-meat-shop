import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Role } from '#common/enums';
import { TokenService } from '#modules/auth';
import { UserRepository } from '#modules/users';
import { ShopRepository } from '#modules/shops';
import { ProductRepository } from '#modules/products';
import { InventoryBatchRepository } from '#modules/inventory';
import { runVirudhunagarSeed } from '../src/database/seeds/seed.js';
import { createTestApp } from './helpers/create-test-app.js';
import { AppModule } from '../src/app.module.js';

const API = '/api/v1';

describe('Virudhunagar End-to-End COD Order & Tracking (e2e)', () => {
  let app: NestExpressApplication;
  let customerToken: string;
  let customerId: string;
  let shopId: string;
  let productId: string;
  let initialStockGrams: number;
  let createdOrderId: string;

  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    // Seed test database
    await runVirudhunagarSeed();

    app = await createTestApp({ imports: [AppModule] });

    const userRepo = app.get(UserRepository);
    const shopRepo = app.get(ShopRepository);
    const productRepo = app.get(ProductRepository);
    const batchRepo = app.get(InventoryBatchRepository);
    const tokenService = app.get(TokenService);

    // 1. Get demo customer
    const customer = await userRepo.findByEmail('demo.customer@virudhunagar.in');
    expect(customer).toBeTruthy();
    customerId = customer!._id;

    // Issue JWT token for demo customer
    customerToken = tokenService.signAccessToken({
      id: customerId,
      role: Role.CUSTOMER,
      permissions: [],
    });

    // 2. Get Virudhunagar Chettinad Mutton Stall
    const shop = await shopRepo.findBySlug('virudhunagar-chettinad-mutton-stall');
    expect(shop).toBeTruthy();
    shopId = shop!._id;

    // 3. Get product: Tender Goat Mutton Curry Cut
    const product = await productRepo.findByShopAndSlug(shopId, 'tender-goat-mutton-curry-cut');
    expect(product).toBeTruthy();
    productId = product!._id;

    // 4. Check initial stock batch
    const today = new Date().toISOString().slice(0, 10);
    const batch = await batchRepo.findByShopProductDate(shopId, productId, today);
    expect(batch).toBeTruthy();
    initialStockGrams = batch!.availableGrams;
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. discovers nearby shops in Virudhunagar', async () => {
    const res = await http()
      .get(`${API}/shops/nearby?lat=9.5680&lng=77.9624&radiusKm=20`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    const found = res.body.data.some((s: { id: string }) => s.id === shopId);
    expect(found).toBe(true);
  });

  it('2. adds fresh cut to customer cart', async () => {
    const res = await http()
      .post(`${API}/cart/items`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        shopId,
        productId,
        grams: 500,
        quantity: 1,
        clearPreviousShop: true,
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.shopId).toBe(shopId);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].productId).toBe(productId);
    expect(res.body.data.items[0].grams).toBe(500);
  });

  it('3. gets accurate checkout quote with packaging and delivery fee', async () => {
    const res = await http()
      .get(`${API}/checkout/quote?lat=9.5680&lng=77.9624`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    const quote = res.body.data;
    expect(quote.shopId).toBe(shopId);
    expect(quote.totalWeightGrams).toBe(500);
    expect(quote.subtotalPaise).toBeGreaterThan(0);
    expect(quote.totalPaise).toBe(
      quote.subtotalPaise + quote.deliveryFeePaise + quote.packagingFeePaise - quote.discountPaise,
    );
  });

  it('4. places Cash On Delivery (COD) order and commits inventory', async () => {
    const res = await http()
      .post(`${API}/orders`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        deliveryAddress: {
          text: '42, Ramamoorthy Road, Virudhunagar Town',
          pincode: '626001',
          district: 'Virudhunagar',
          location: { lat: 9.568, lng: 77.9624 },
          label: 'Home',
        },
        paymentMethod: 'COD',
        customerNotes: 'Please ring bell upon arrival at door',
      });

    if (res.status !== 201) {
      console.error('ORDER CREATE ERROR:', JSON.stringify(res.body, null, 2));
    }
    expect(res.status).toBe(201);

    expect(res.body.success).toBe(true);
    const order = res.body.data;
    createdOrderId = order.id;

    expect(order.orderNumber).toMatch(/^TN-\d{8}-\d{4}$/);
    expect(order.status).toBe('PLACED');
    expect(order.payment.method).toBe('COD');
    expect(order.payment.status).toBe('COD_PENDING');
    expect(order.items[0].grams).toBe(500);

    // Verify 500g deducted from available stock
    const batchRepo = app.get(InventoryBatchRepository);
    const today = new Date().toISOString().slice(0, 10);
    const updatedBatch = await batchRepo.findByShopProductDate(shopId, productId, today);
    expect(updatedBatch!.availableGrams).toBe(initialStockGrams - 500);
  });

  it('5. fetches order tracking details and timeline', async () => {
    const res = await http()
      .get(`${API}/orders/${createdOrderId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    const order = res.body.data;
    expect(order.id).toBe(createdOrderId);
    expect(order.status).toBe('PLACED');
    expect(order.timeline).toBeInstanceOf(Array);
    expect(order.timeline.some((t: { toStatus: string }) => t.toStatus === 'PLACED')).toBe(true);
  });

  it('6. vendor views order on live fulfilment board', async () => {
    const userRepo = app.get(UserRepository);
    const tokenService = app.get(TokenService);
    const vendorUser = await userRepo.findByEmail('muthu.mutton@virudhunagar-meats.in');
    expect(vendorUser).toBeTruthy();

    const vendorToken = tokenService.signAccessToken({
      id: vendorUser!._id,
      role: Role.VENDOR_OWNER,
      shopId,
      permissions: [],
    });

    // List shop orders
    const listRes = await http()
      .get(`${API}/vendor/orders`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .expect(200);

    expect(listRes.body.success).toBe(true);
    expect(listRes.body.data.some((o: { id: string }) => o.id === createdOrderId)).toBe(true);

    // Accept order
    const acceptRes = await http()
      .patch(`${API}/vendor/orders/${createdOrderId}/status`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ status: 'ACCEPTED', reason: 'Fresh morning cut scheduled' })
      .expect(200);

    expect(acceptRes.body.data.status).toBe('ACCEPTED');

    // Start preparation
    const prepRes = await http()
      .patch(`${API}/vendor/orders/${createdOrderId}/status`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({ status: 'PREPARING', reason: 'Cutting and cleaning pieces' })
      .expect(200);

    expect(prepRes.body.data.status).toBe('PREPARING');

    // Mark ready with recorded packed weight
    const readyRes = await http()
      .patch(`${API}/vendor/orders/${createdOrderId}/status`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({
        status: 'READY',
        reason: 'Packed with chilled insulation ice gel',
        actualPackedWeights: { [productId]: 515 },
      })
      .expect(200);

    expect(readyRes.body.data.status).toBe('READY');
    expect(readyRes.body.data.items[0].actualPackedGrams).toBe(515);
  });

  it('7. customer accesses delivery task and 4-digit handover OTP', async () => {
    const res = await http()
      .get(`${API}/delivery/tasks/order/${createdOrderId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    const task = res.body.data;
    expect(task.orderId).toBe(createdOrderId);
    expect(task.otpPlain).toMatch(/^\d{4}$/);
    expect(task.codAmountPaise).toBeGreaterThan(0);
  });
});
