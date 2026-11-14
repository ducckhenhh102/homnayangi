import test from 'node:test';
import assert from 'node:assert/strict';
import { clampRadius, validatePreferences, VALID_DINING_TYPES } from './discoveryUtils.js';

test('clampRadius limits radius strictly between 1 and 10 km', () => {
  assert.equal(clampRadius(0), 1);
  assert.equal(clampRadius(-5), 1);
  assert.equal(clampRadius(1), 1);
  assert.equal(clampRadius(5), 5);
  assert.equal(clampRadius(10), 10);
  assert.equal(clampRadius(20), 10);
  assert.equal(clampRadius('invalid'), 10);
});

test('validatePreferences validates dining types and radius', () => {
  assert.deepEqual(
    validatePreferences({ diningType: 'snack', radiusKm: 7, location: { lat: 21.0, lng: 105.8 } }),
    { diningType: 'snack', radiusKm: 7, isLocationValid: true }
  );

  // Invalid fallback
  assert.deepEqual(
    validatePreferences({ diningType: 'invalid', radiusKm: 99, location: {} }),
    { diningType: 'meal', radiusKm: 10, isLocationValid: false }
  );
});
