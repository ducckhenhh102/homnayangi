import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Seeding database...');

  // 1. Seed Companion Types
  const companionTypes = [
    { id: 'couple', name: 'Người yêu', description: 'Không gian lãng mạn, ấm cúng, hẹn hò lý tưởng' },
    { id: 'friends', name: 'Nhóm bạn', description: 'Không khí vui tươi, thoải mái trò chuyện, bàn rộng' },
    { id: 'solo', name: 'Một mình', description: 'Gọn gàng, yên tĩnh, đồ ăn nhanh chất lượng' },
  ];

  for (const item of companionTypes) {
    await prisma.companionType.upsert({
      where: { id: item.id },
      update: { name: item.name, description: item.description },
      create: item,
    });
  }

  // 2. Seed Dining Types
  const diningTypes = [
    { id: 'snack', name: 'Ăn vặt', description: 'Trà sữa, kem, bánh tráng, xiên que ăn nhẹ' },
    { id: 'meal', name: 'Ăn bình thường', description: 'Bữa chính ấm bụng: cơm, bún, phở, lẩu, nướng' },
    { id: 'drinking', name: 'Đi nhậu', description: 'Lai rai tối muộn, mồi bén, tụ tập cụng ly' },
  ];

  for (const item of diningTypes) {
    await prisma.diningType.upsert({
      where: { id: item.id },
      update: { name: item.name, description: item.description },
      create: item,
    });
  }

  // 3. Seed Sample Foods
  const sampleFoods = [
    { name: 'Phở bò tái lăn', slug: 'pho-bo-tai-lan', category: 'Bún & Phở', description: 'Phở bò tái lăn nước dùng thơm béo đậm đà' },
    { name: 'Bún chả Hà Nội', slug: 'bun-cha-ha-noi', category: 'Bún & Phở', description: 'Bún chả nướng than hoa chả giò giòn rụm' },
    { name: 'Bánh tráng nướng Đà Lạt', slug: 'banh-trang-nuong-da-lat', category: 'Ăn vặt', description: 'Bánh tráng nướng trứng cút, tép khô, phô mai béo ngậy' },
    { name: 'Trà sữa trân châu hoàng kim', slug: 'tra-sua-tran-chau-hoang-kim', category: 'Đồ uống', description: 'Trà ô long sữa kèm trân châu hoàng kim dẻo mềm' },
    { name: 'Lẩu ếch măng cay', slug: 'lau-ech-mang-cay', category: 'Lẩu & Nướng', description: 'Lẩu ếch xào măng cay cay chua chua đậm vị' },
    { name: 'Bò nướng tảng sốt trứng muối', slug: 'bo-nuong-tang-trung-muoi', category: 'Lẩu & Nướng', description: 'Thịt bò tảng mềm mọng sốt trứng muối béo thơm' },
  ];

  const createdFoods = [];
  for (const food of sampleFoods) {
    const f = await prisma.food.upsert({
      where: { slug: food.slug },
      update: food,
      create: food,
    });
    createdFoods.push(f);
  }

  // 4. Seed Verified / Demo Sample Restaurants (Hanoi Coordinates)
  const sampleRestaurants = [
    {
      name: 'Phở Thìn Lò Đúc (Demo)',
      slug: 'pho-thin-lo-duc-demo',
      address: '13 Lò Đúc, Ngô Thì Nhậm, Hai Bà Trưng, Hà Nội',
      latitude: 21.01878,
      longitude: 105.85642,
      priceMin: 65000,
      priceMax: 90000,
      status: 'PUBLISHED',
      description: 'Quán phở tái lăn nức tiếng Hà Nội với nước dùng hành béo đặc trưng.',
      diningTypeIds: ['meal'],
      companionScores: [
        { companionTypeId: 'solo', score: 95 },
        { companionTypeId: 'friends', score: 80 },
        { companionTypeId: 'couple', score: 70 },
      ],
      foodSlugs: ['pho-bo-tai-lan'],
    },
    {
      name: 'Bún Chả Hương Liên - Obama (Demo)',
      slug: 'bun-cha-huong-lien-obama-demo',
      address: '24 Lê Văn Hưu, Phan Chu Trinh, Hai Bà Trưng, Hà Nội',
      latitude: 21.01912,
      longitude: 105.85295,
      priceMin: 50000,
      priceMax: 120000,
      status: 'PUBLISHED',
      description: 'Quán bún chả nổi tiếng từng tiếp đón cựu Tổng thống Obama.',
      diningTypeIds: ['meal'],
      companionScores: [
        { companionTypeId: 'friends', score: 90 },
        { companionTypeId: 'couple', score: 85 },
        { companionTypeId: 'solo', score: 80 },
      ],
      foodSlugs: ['bun-cha-ha-noi'],
    },
    {
      name: 'Bánh Tráng Nướng & Trà Sữa Phố Cổ (Demo)',
      slug: 'banh-trang-nuong-pho-co-demo',
      address: '48 Hàng Chiếu, Đồng Xuân, Hoàn Kiếm, Hà Nội',
      latitude: 21.03685,
      longitude: 105.85172,
      priceMin: 25000,
      priceMax: 50000,
      status: 'PUBLISHED',
      description: 'Điểm hẹn ăn vặt trà chiều quen thuộc của giới trẻ phố cổ.',
      diningTypeIds: ['snack'],
      companionScores: [
        { companionTypeId: 'couple', score: 95 },
        { companionTypeId: 'friends', score: 90 },
        { companionTypeId: 'solo', score: 60 },
      ],
      foodSlugs: ['banh-trang-nuong-da-lat', 'tra-sua-tran-chau-hoang-kim'],
    },
    {
      name: 'Lẩu Ếch Măng Cay & Nướng Phố Phó Đức Chính (Demo)',
      slug: 'lau-ech-pho-duc-chinh-demo',
      address: '29 Phó Đức Chính, Trúc Bạch, Ba Đình, Hà Nội',
      latitude: 21.04351,
      longitude: 105.84234,
      priceMin: 150000,
      priceMax: 300000,
      status: 'PUBLISHED',
      description: 'Không gian tụ tập lai rai nhậu bia hơi cùng lẩu ếch măng cay.',
      diningTypeIds: ['drinking', 'meal'],
      companionScores: [
        { companionTypeId: 'friends', score: 95 },
        { companionTypeId: 'couple', score: 70 },
        { companionTypeId: 'solo', score: 40 },
      ],
      foodSlugs: ['lau-ech-mang-cay', 'bo-nuong-tang-trung-muoi'],
    },
  ];

  for (const r of sampleRestaurants) {
    const restaurant = await prisma.restaurant.upsert({
      where: { slug: r.slug },
      update: {
        name: r.name,
        address: r.address,
        latitude: r.latitude,
        longitude: r.longitude,
        priceMin: r.priceMin,
        priceMax: r.priceMax,
        status: r.status,
        description: r.description,
      },
      create: {
        name: r.name,
        slug: r.slug,
        address: r.address,
        latitude: r.latitude,
        longitude: r.longitude,
        priceMin: r.priceMin,
        priceMax: r.priceMax,
        status: r.status,
        description: r.description,
      },
    });

    // Link dining types
    for (const dtId of r.diningTypeIds) {
      await prisma.restaurantDiningType.upsert({
        where: {
          restaurantId_diningTypeId: {
            restaurantId: restaurant.id,
            diningTypeId: dtId,
          },
        },
        update: {},
        create: {
          restaurantId: restaurant.id,
          diningTypeId: dtId,
        },
      });
    }

    // Link companion types
    for (const cs of r.companionScores) {
      await prisma.restaurantCompanionType.upsert({
        where: {
          restaurantId_companionTypeId: {
            restaurantId: restaurant.id,
            companionTypeId: cs.companionTypeId,
          },
        },
        update: { suitabilityScore: cs.score },
        create: {
          restaurantId: restaurant.id,
          companionTypeId: cs.companionTypeId,
          suitabilityScore: cs.score,
        },
      });
    }

    // Link foods
    for (const foodSlug of r.foodSlugs) {
      const foodRecord = createdFoods.find((f) => f.slug === foodSlug);
      if (foodRecord) {
        await prisma.restaurantFood.upsert({
          where: {
            restaurantId_foodId: {
              restaurantId: restaurant.id,
              foodId: foodRecord.id,
            },
          },
          update: {},
          create: {
            restaurantId: restaurant.id,
            foodId: foodRecord.id,
            priceVnd: r.priceMin,
          },
        });
      }
    }
  }

  console.log('[Seed] Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
