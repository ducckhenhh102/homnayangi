import test from 'node:test';
import assert from 'node:assert/strict';
import { clampRadius, validatePreferences, VALID_COMPANIONS, VALID_DINING_TYPES } from './discoveryUtils.js';

test('clampRadius limits radius strictly between 1 and 10 km', () => {
  assert.equal(clampRadius(0), 1);
  assert.equal(clampRadius(-5), 1);
  assert.equal(clampRadius(1), 1);
  assert.equal(clampRadius(5), 5);
  assert.equal(clampRadius(10), 10);
  assert.equal(clampRadius(20), 10);
  assert.equal(clampRadius('invalid'), 5);
});

test('validatePreferences validates companions and dining types', () => {
  assert.deepEqual(
    validatePreferences({ companion: 'friends', diningType: 'snack', radiusKm: 7, location: { lat: 21.0, lng: 105.8 } }),
    { companion: 'friends', diningType: 'snack', radiusKm: 7, isLocationValid: true }
  );

  // Invalid fallback
  assert.deepEqual(
    validatePreferences({ companion: 'unknown', diningType: 'invalid', radiusKm: 99, location: {} }),
    { companion: 'couple', diningType: 'meal', radiusKm: 10, isLocationValid: false }
  );
});
