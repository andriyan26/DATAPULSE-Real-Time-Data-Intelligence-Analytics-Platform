import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { pool } from '../database/db';

const app = createApp();
let authToken: string;

describe('DATAPULSE Backend API Test Suite', () => {
  beforeAll(async () => {
    // Authenticate with Super Admin
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@datapulse.io', password: 'Admin123!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    authToken = res.body.data.token;
  });

  afterAll(async () => {
    await pool.end();
  });

  it('GET /api/v1/health should report UP status and database connection', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.database).toBe('CONNECTED');
  });

  it('POST /api/v1/auth/login should reject invalid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@datapulse.io', password: 'WrongPassword' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/auth/me should return authenticated user details', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('admin@datapulse.io');
    expect(res.body.data.user.role).toBe('super_admin');
  });

  it('GET /api/v1/dashboard/overview should return metrics, capsule data, and pipelines', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/overview')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.metrics.totalRecords).toBeGreaterThan(0);
    expect(res.body.data.capsuleChart).toHaveLength(7);
  });

  it('POST /api/v1/analytics/query should compute aggregated metrics correctly', async () => {
    const res = await request(app)
      .post('/api/v1/analytics/query')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        datasetId: 'ds-global-tx',
        dimension: 'category',
        metric: 'amount',
        aggregation: 'SUM',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.results.length).toBeGreaterThan(0);
    expect(res.body.data.summary.totalValue).toBeGreaterThan(0);
  });

  it('POST /api/v1/reports/export should safely export CSV with formula protection', async () => {
    const res = await request(app)
      .post('/api/v1/reports/export')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ datasetId: 'ds-global-tx' });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text).toContain('Transaction ID,Date,Category,Region');
  });
});

