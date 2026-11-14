import test from 'node:test';
import assert from 'node:assert/strict';
import { distanceKm, getBoundingBox } from '../src/utils/geo.js';

test('distanceKm calculates correct geographical distance', () => {
  // Hoan Kiem to Cau Giay, Hanoi (~6.6 km)
  const d = distanceKm(21.0285, 105.8544, 21.0362, 105.7906);
  assert.ok(d >= 6.4 && d <= 6.8, `Expected ~6.6 km, got ${d}`);

  // Same coordinates
  assert.equal(distanceKm(21.0, 105.0, 21.0, 105.0), 0);

  // Hanoi to Ho Chi Minh City (~1138 km)
  const hanoiToHcm = distanceKm(21.0285, 105.8544, 10.7769, 106.7008);
  assert.ok(hanoiToHcm >= 1130 && hanoiToHcm <= 1150);
});

test('getBoundingBox encompasses the specified radius', () => {
  const centerLat = 21.0285;
  const centerLng = 105.8544;
  const radiusKm = 10;

  const box = getBoundingBox(centerLat, centerLng, radiusKm);
  assert.ok(box.minLat < centerLat);
  assert.ok(box.maxLat > centerLat);
  assert.ok(box.minLng < centerLng);
  assert.ok(box.maxLng > centerLng);

  // A point 9 km away vertically should be inside bounding box
  const testPointLat = centerLat + 9 / 111.0;
  assert.ok(testPointLat <= box.maxLat);
});
