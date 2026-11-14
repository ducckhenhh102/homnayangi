import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mapGoogleTypesToDiningTypes, getIncludedGoogleTypes } from '../src/integrations/places/typeMapper.js';
import { MockPlacesAdapter } from '../src/integrations/places/mockPlaces.adapter.js';
import { hybridPlacesService } from '../src/integrations/places/places.service.js';
import restaurantRepository from '../src/repositories/restaurant.repository.js';
import prisma from '../src/config/db.js';

describe('Phase 12 — Google Places Provider & Hybrid Integration Tests', () => {
  test('typeMapper maps cafe/bakery to snack with high confidence', () => {
    const res = mapGoogleTypesToDiningTypes(['cafe', 'bakery'], 'cafe');
    assert.ok(res.diningTypes.includes('snack'));
    assert.equal(res.confidence, 'high');
  });

  test('typeMapper maps bar/pub to drinking', () => {
    const res = mapGoogleTypesToDiningTypes(['bar', 'pub'], 'bar');
    assert.ok(res.diningTypes.includes('drinking'));
    assert.equal(res.confidence, 'high');
  });

  test('typeMapper maps restaurant to meal', () => {
    const res = mapGoogleTypesToDiningTypes(['vietnamese_restaurant'], 'vietnamese_restaurant');
    assert.ok(res.diningTypes.includes('meal'));
    assert.equal(res.confidence, 'high');
  });

  test('typeMapper handles unknown types gracefully with low or unknown confidence', () => {
    const res = mapGoogleTypesToDiningTypes(['dentist', 'school']);
    assert.equal(res.confidence, 'unknown');
    assert.equal(res.diningTypes.length, 0);
  });

  test('MockPlacesAdapter returns nearby places within radius with attribution', async () => {
    const mockAdapter = new MockPlacesAdapter();
    const results = await mockAdapter.searchNearby({
      lat: 21.0318,
      lng: 105.8510,
      radiusKm: 5,
    });

    assert.ok(Array.isArray(results));
    assert.ok(results.length > 0);
    for (const r of results) {
      assert.ok(r.id.startsWith('places:'));
      assert.equal(r.source, 'google_places');
      assert.ok(r.attribution);
      assert.equal(r.attribution.provider, 'Google Places');
      assert.ok(r.distanceKm <= 5);
    }
  });

  test('MockPlacesAdapter respects diningType filter', async () => {
    const mockAdapter = new MockPlacesAdapter();
    const results = await mockAdapter.searchNearby({
      lat: 21.0318,
      lng: 105.8510,
      radiusKm: 10,
      diningType: 'snack',
    });

    assert.ok(results.length > 0);
    for (const r of results) {
      assert.ok(r.diningTypes.includes('snack'));
    }
  });

  test('HybridPlacesService merges internal and external when PLACES_ENABLED=true', async () => {
    const originalEnv = process.env.PLACES_ENABLED;
    process.env.PLACES_ENABLED = 'true';

    const mockAdapter = new MockPlacesAdapter();
    hybridPlacesService.setProvider(mockAdapter);

    try {
      const result = await hybridPlacesService.getNearbyHybrid({
        lat: 21.0336, // Hoan Kiem, Hanoi
        lng: 105.8475,
        radiusKm: 10,
        page: 1,
        limit: 20,
      });

      assert.ok(result.data.length > 0);
      assert.ok(result.meta.sources.includes('internal'));
      assert.ok(result.meta.sources.includes('google_places'));
      assert.equal(result.meta.partialResults, false);

      // Verify both internal and places formats are present
      const internalItem = result.data.find((d) => d.source === 'internal');
      assert.ok(internalItem, 'Should contain internal restaurant candidates');
    } finally {
      process.env.PLACES_ENABLED = originalEnv;
    }
  });

  test('HybridPlacesService handles provider errors gracefully with partialResults=true', async () => {
    const originalEnv = process.env.PLACES_ENABLED;
    process.env.PLACES_ENABLED = 'true';

    const mockAdapter = new MockPlacesAdapter();
    mockAdapter.setFailure(true, 429, 'Google Places Quota Exceeded (429)');
    hybridPlacesService.setProvider(mockAdapter);

    try {
      const result = await hybridPlacesService.getNearbyHybrid({
        lat: 21.0336,
        lng: 105.8475,
        radiusKm: 10,
        page: 1,
        limit: 20,
      });

      // Does not throw 500, still returns internal restaurants
      assert.ok(result.data.length > 0);
      assert.equal(result.meta.partialResults, true);
      assert.ok(result.data.every((d) => d.source === 'internal'));
    } finally {
      process.env.PLACES_ENABLED = originalEnv;
    }
  });

  test('HybridPlacesService getPlaceDetail handles external places: ID', async () => {
    const mockAdapter = new MockPlacesAdapter();
    hybridPlacesService.setProvider(mockAdapter);

    const place = await hybridPlacesService.getPlaceDetail('places:ChIJN1t_tDeuEmsRUsoyG83frY4');
    assert.ok(place.data);
    assert.equal(place.data.rawId, 'ChIJN1t_tDeuEmsRUsoyG83frY4');
    assert.equal(place.data.source, 'google_places');
    assert.ok(place.data.attribution);
  });
});
