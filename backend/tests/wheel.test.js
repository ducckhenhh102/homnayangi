import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../src/app.js';
import prisma from '../src/config/db.js';

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
  await prisma.$disconnect();
  await new Promise((resolve) => server.close(resolve));
});

test('POST /api/v1/wheel/spin in restaurant mode selects an eligible restaurant', async () => {
  const res = await fetch(`${baseUrl}/api/v1/wheel/spin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode: 'restaurant',
      filters: {
        lat: 21.0285,
        lng: 105.8542,
        radiusKm: 10,
        companion: 'friends',
        diningType: 'meal',
      },
    }),
  });

  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(body.data);
  assert.equal(body.data.mode, 'restaurant');
  assert.ok(body.data.selected.id.startsWith('internal:'));
  assert.ok(body.data.selected.distanceKm <= 10);
});

test('POST /api/v1/wheel/spin in food mode selects a food available at a nearby restaurant', async () => {
  const res = await fetch(`${baseUrl}/api/v1/wheel/spin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode: 'food',
      filters: {
        lat: 21.0285,
        lng: 105.8542,
        radiusKm: 10,
      },
    }),
  });

  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(body.data);
  assert.equal(body.data.mode, 'food');
  assert.ok(body.data.selected.name);
  assert.ok(body.data.selected.availableAt.length > 0, 'Food must have at least one restaurant in radius');
});

test('POST /api/v1/wheel/spin with no candidates returns data null and reason NO_CANDIDATES', async () => {
  const res = await fetch(`${baseUrl}/api/v1/wheel/spin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode: 'restaurant',
      filters: {
        lat: 0.0, // Middle of ocean
        lng: 0.0,
        radiusKm: 5,
      },
    }),
  });

  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.data, null);
  assert.equal(body.meta.reason, 'NO_CANDIDATES');
});
