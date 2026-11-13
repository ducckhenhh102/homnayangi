import test from 'node:test';
import assert from 'node:assert/strict';
import prisma from '../src/config/db.js';

test('DB has seeded dining types and companion types', async () => {
  const diningTypes = await prisma.diningType.findMany();
  assert.equal(diningTypes.length, 3);
  const diningIds = diningTypes.map((d) => d.id).sort();
  assert.deepEqual(diningIds, ['drinking', 'meal', 'snack']);

  const companionTypes = await prisma.companionType.findMany();
  assert.equal(companionTypes.length, 3);
  const companionIds = companionTypes.map((c) => c.id).sort();
  assert.deepEqual(companionIds, ['couple', 'friends', 'solo']);
});

test('DB restaurants have related dining types and foods', async () => {
  const restaurants = await prisma.restaurant.findMany({
    include: {
      diningTypes: { include: { diningType: true } },
      companionTypes: { include: { companionType: true } },
      foods: { include: { food: true } },
    },
  });

  assert.ok(restaurants.length >= 4);
  for (const r of restaurants) {
    assert.ok(r.diningTypes.length > 0, `Restaurant ${r.name} has dining types`);
    assert.ok(r.latitude >= -90 && r.latitude <= 90);
    assert.ok(r.longitude >= -180 && r.longitude <= 180);
    if (r.priceMin != null && r.priceMax != null) {
      assert.ok(r.priceMin <= r.priceMax);
    }
  }
});

test('Unique slug constraint prevents duplicate restaurant slugs', async () => {
  let failed = false;
  try {
    await prisma.restaurant.create({
      data: {
        name: 'Duplicate Test',
        slug: 'pho-thin-lo-duc-demo', // Already exists in seed
        address: 'Hà Nội',
        latitude: 21.0,
        longitude: 105.8,
      },
    });
  } catch (err) {
    failed = true;
    assert.ok(err.message.includes('Unique constraint') || err.code === 'P2002');
  }
  assert.equal(failed, true, 'Duplicate slug should throw unique constraint error');
});

test.after(async () => {
  await prisma.$disconnect();
});
