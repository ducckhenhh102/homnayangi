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
