import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { generateId } from '#common/utils';
import { ProbeController } from './fixtures/probe.controller.js';
import { createTestApp } from './helpers/create-test-app.js';

const API = '/api/v1';

describe('HTTP pipeline (e2e)', () => {
  let app: NestExpressApplication;
  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    app = await createTestApp({ controllers: [ProbeController] });
  });

  afterAll(async () => {
    await app.close();
  });

  it('serves health checks without the envelope', async () => {
    const res = await http().get(`${API}/health`).expect(200);
    expect(res.body).toMatchObject({ status: 'ok', info: { mongodb: { status: 'up' } } });
  });

  it('wraps results in the success envelope and returns a request id', async () => {
    const id = generateId();
    const res = await http().get(`${API}/probe/items/${id}`).expect(200);
    expect(res.body).toEqual({ success: true, data: { id } });
    expect(res.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('reuses a valid incoming request id', async () => {
    const requestId = generateId();
    const res = await http().get(`${API}/probe/stock`).set('x-request-id', requestId).expect(409);
    expect(res.headers['x-request-id']).toBe(requestId);
    expect(res.body.error.requestId).toBe(requestId);
  });

  it('rejects non-UUID-v7 ids', async () => {
    const res = await http().get(`${API}/probe/items/507f1f77bcf86cd799439011`).expect(400);
    expect(res.body.error).toMatchObject({ code: 'VALIDATION_FAILED', details: [{ field: 'id' }] });
  });

  it('returns paginated lists as data + meta with query defaults', async () => {
    const res = await http().get(`${API}/probe/items?page=2`).expect(200);
    expect(res.body).toEqual({
      success: true,
      data: [{ n: 1 }, { n: 2 }],
      meta: { page: 2, limit: 20, total: 42, totalPages: 3, hasNext: true, hasPrev: true },
    });
  });

  it('validates bodies, rejecting unknown fields', async () => {
    const res = await http()
      .post(`${API}/probe/items`)
      .send({ name: 'x', grams: 600, role: 'ADMIN' })
      .expect(400);
    const fields = res.body.error.details.map((d: { field: string }) => d.field);
    expect(fields).toEqual(expect.arrayContaining(['name', 'grams', 'role']));
  });

  it('maps AppException to its catalogued status and code', async () => {
    const res = await http().get(`${API}/probe/stock`).expect(409);
    expect(res.body).toMatchObject({
      success: false,
      error: {
        code: 'OUT_OF_STOCK',
        message: 'Not enough stock',
        details: { available: 250 },
        path: `${API}/probe/stock`,
      },
    });
  });

  it('returns INTERNAL_ERROR in the standard shape for unexpected errors', async () => {
    const res = await http().get(`${API}/probe/crash`).expect(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('requires authentication for role- and permission-protected routes', async () => {
    await http().get(`${API}/probe/vendor-only`).expect(401);
    await http().get(`${API}/probe/needs-permission`).expect(401);
  });

  it('returns ROUTE_NOT_FOUND for unknown routes', async () => {
    const res = await http().get(`${API}/does-not-exist`).expect(404);
    expect(res.body.error.code).toBe('ROUTE_NOT_FOUND');
  });
});
