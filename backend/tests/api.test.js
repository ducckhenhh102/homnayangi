import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../src/app.js';

let server;
let baseUrl;

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
  await new Promise((resolve) => server.close(resolve));
});

test('GET /api/v1/health returns 200 and status ok', async () => {
  const res = await fetch(`${baseUrl}/api/v1/health`);
  assert.equal(res.status, 200);

  const body = await res.json();
  assert.equal(body.data.status, 'ok');
  assert.ok(body.data.timestamp);
});

test('GET /api/v1/discovery/options returns discovery metadata', async () => {
  const res = await fetch(`${baseUrl}/api/v1/discovery/options`);
  assert.equal(res.status, 200);

  const body = await res.json();
  assert.ok(Array.isArray(body.data.companionTypes));
  assert.ok(Array.isArray(body.data.diningTypes));
  assert.equal(body.data.maxRadiusKm, 10);
});

test('GET unknown route returns 404 with standard error JSON', async () => {
  const res = await fetch(`${baseUrl}/api/v1/not-a-real-endpoint`);
  assert.equal(res.status, 404);

  const body = await res.json();
  assert.equal(body.error.code, 'NOT_FOUND');
  assert.ok(body.error.message.includes('không tồn tại'));
});

test('GET /api/v1/restaurants returns list of internal restaurants', async () => {
  const res = await fetch(`${baseUrl}/api/v1/restaurants?limit=5`);
  assert.equal(res.status, 200);

  const body = await res.json();
  assert.ok(Array.isArray(body.data));
  assert.ok(body.data.length > 0);
  assert.ok(body.meta.total > 0);

  const first = body.data[0];
  assert.ok(first.id.startsWith('internal:'));
  assert.equal(first.source, 'internal');
  assert.ok(first.location.lat);
  assert.ok(first.location.lng);
});

test('GET /api/v1/restaurants/:id returns restaurant detail or 404', async () => {
  const res = await fetch(`${baseUrl}/api/v1/restaurants/pho-thin-lo-duc-demo`);
  assert.equal(res.status, 200);

  const body = await res.json();
  assert.equal(body.data.slug, 'pho-thin-lo-duc-demo');
  assert.ok(body.data.foods.length > 0);

  const notFound = await fetch(`${baseUrl}/api/v1/restaurants/unknown-place-9999`);
  assert.equal(notFound.status, 404);
});
