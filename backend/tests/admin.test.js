import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../src/app.js';
import prisma from '../src/config/db.js';

let server;
let baseUrl;
let adminToken = '';

test.before(async () => {
  server = http.createServer(app);
  await new Promise((resolve) => {
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await prisma.$disconnect();
  await new Promise((resolve) => server.close(resolve));
});

test('Unauthorized request to /api/v1/admin/restaurants returns 401', async () => {
  const res = await fetch(`${baseUrl}/api/v1/admin/restaurants`);
  assert.equal(res.status, 401);
  const body = await res.json();
  assert.equal(body.error.code, 'UNAUTHORIZED');
});

test('Login with wrong password returns 401 and generic error', async () => {
  const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@homnayangi.vn', password: 'wrongpassword' }),
  });
  assert.equal(res.status, 401);
  const body = await res.json();
  assert.equal(body.error.code, 'INVALID_CREDENTIALS');
});

test('Login with correct password returns 200 and JWT token', async () => {
  const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin', password: 'admin' }),
  });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(body.meta.token);
  assert.equal(body.data.user.role, 'admin');
  adminToken = body.meta.token;
});

test('Admin can list all restaurants with token', async () => {
  const res = await fetch(`${baseUrl}/api/v1/admin/restaurants`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(Array.isArray(body.data));
  assert.ok(body.meta.total > 0);
});

test('Admin can create new restaurant and duplicate slug fails', async () => {
  const uniqueSlug = `test-quan-an-${Date.now()}`;
  const newRestaurant = {
    name: 'Quán Ăn Thử Nghiệm Admin',
    slug: uniqueSlug,
    address: '123 Đường Cầu Giấy, Hà Nội',
    latitude: 21.0362,
    longitude: 105.7905,
    priceMin: 30000,
    priceMax: 70000,
    status: 'PUBLISHED',
    diningTypeIds: ['snack', 'meal'],
    companionScores: [{ companionTypeId: 'friends', score: 90 }],
  };

  const createRes = await fetch(`${baseUrl}/api/v1/admin/restaurants`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify(newRestaurant),
  });

  assert.equal(createRes.status, 201);
  const createBody = await createRes.json();
  assert.equal(createBody.data.slug, uniqueSlug);

  // Attempt duplicate slug creation
  const duplicateRes = await fetch(`${baseUrl}/api/v1/admin/restaurants`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify(newRestaurant),
  });
  assert.equal(duplicateRes.status, 400);
  const dupBody = await duplicateRes.json();
  assert.equal(dupBody.error.code, 'SLUG_EXISTS');

  // Clean up soft delete
  const rawId = createBody.data.rawId;
  const deleteRes = await fetch(`${baseUrl}/api/v1/admin/restaurants/${rawId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.equal(deleteRes.status, 200);
});

test('Admin can request signed Cloudinary upload params', async () => {
  const res = await fetch(`${baseUrl}/api/v1/admin/uploads/signature`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.equal(res.status, 200);

  const body = await res.json();
  assert.ok(body.data.signature);
  assert.ok(body.data.timestamp);
  assert.equal(body.data.cloudName, 'dahateimp');
  assert.equal(body.data.apiKey, '172137129749838');
  assert.ok(body.data.folder.includes('hom-nay-an-gi'));
});
