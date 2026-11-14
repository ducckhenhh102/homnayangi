import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../src/app.js';
import prisma from '../src/config/db.js';
import jwt from 'jsonwebtoken';

describe('User Submissions & Permanent Delete Tests', () => {
  let server;
  let baseUrl;
  let adminToken;
  let testSubmissionId;
  let createdRestaurantId;

  before(async () => {
    server = http.createServer(app);
    await new Promise((resolve) => {
      server.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });

    // Get or create real admin user
    let adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
    const adminId = adminUser ? adminUser.id : 'test-admin-id';

    // Generate valid admin token
    adminToken = jwt.sign(
      { id: adminId, email: 'admin@homnayangi.vn', role: 'admin' },
      process.env.JWT_SECRET || 'test_jwt_secret_key_minimum_32_characters_long',
      { expiresIn: '1h' }
    );
  });

  after(async () => {
    if (createdRestaurantId) {
      await prisma.restaurant.deleteMany({ where: { id: createdRestaurantId } });
    }
    if (testSubmissionId) {
      await prisma.restaurantSubmission.deleteMany({ where: { id: testSubmissionId } });
    }
    await new Promise((resolve) => server.close(resolve));
  });

  test('Public user can submit a new restaurant recommendation', async () => {
    const payload = {
      name: 'Quán Phở Đề Xuất Test',
      address: '99 Phố Test, Hà Nội',
      latitude: 21.0300,
      longitude: 105.8500,
      description: 'Quán phở ngon người dùng chia sẻ',
      diningTypes: ['meal'],
      priceMin: 40000,
      priceMax: 70000,
      submitterName: 'Người Dùng Ẩn Danh',
      submitterContact: '0912345678',
    };

    const res = await fetch(`${baseUrl}/api/v1/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.ok(body.data.id);
    testSubmissionId = body.data.id;
  });

  test('Admin can list submissions and see pending items', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/submissions?status=PENDING`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.data));
    const found = body.data.find((s) => s.id === testSubmissionId);
    assert.ok(found, 'Should find the newly submitted restaurant');
    assert.equal(found.status, 'PENDING');
  });

  test('Admin can approve submission, creating official restaurant with PUBLISHED status', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/submissions/${testSubmissionId}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.data.restaurant);
    createdRestaurantId = body.data.restaurant.id;
    assert.equal(body.data.restaurant.status, 'PUBLISHED');

    // Verify submission is marked as APPROVED
    const sub = await prisma.restaurantSubmission.findUnique({ where: { id: testSubmissionId } });
    assert.equal(sub.status, 'APPROVED');
  });

  test('Admin can permanently delete restaurant', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/restaurants/${createdRestaurantId}/permanent`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.equal(res.status, 200);
    const deleted = await prisma.restaurant.findUnique({ where: { id: createdRestaurantId } });
    assert.equal(deleted, null, 'Restaurant should be permanently removed from DB');
    createdRestaurantId = null;
  });
});
