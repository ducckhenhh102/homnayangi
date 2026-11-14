import prisma from '../src/config/db.js';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export const REAL_HANOI_RESTAURANTS = [
  // --- BỮA ĂN CHÍNH (MEAL) ---
  {
    name: 'Phở Gia Truyền Bát Đàn',
    address: '49 Bát Đàn, Cửa Đông, Hoàn Kiếm, Hà Nội',
    lat: 21.0336,
    lng: 105.8475,
    diningTypes: ['meal'],
    priceMin: 55000,
    priceMax: 85000,
    description: 'Phở bò gia truyền nổi tiếng phố cổ với nước dùng trong ngọt thanh và thịt bò tươi ngon.',
    companions: [
      { id: 'solo', score: 95 },
      { id: 'friends', score: 85 },
      { id: 'couple', score: 80 },
    ],
    foods: ['Phở bò tái nạm', 'Phở bò tái lăn'],
  },
  {
    name: 'Phở 10 Lý Quốc Sư',
    address: '10 Lý Quốc Sư, Hàng Trống, Hoàn Kiếm, Hà Nội',
    lat: 21.0305,
    lng: 105.8502,
    diningTypes: ['meal'],
    priceMin: 65000,
    priceMax: 110000,
    description: 'Thương hiệu phở bò trứ danh thủ đô, không gian sạch sẽ, phục vụ chu đáo.',
    companions: [
      { id: 'couple', score: 90 },
      { id: 'friends', score: 85 },
      { id: 'solo', score: 85 },
    ],
    foods: ['Phở đặc biệt bắp gầu', 'Quẩy giòn'],
  },
  {
    name: 'Bún Chả Đắc Kim - Hàng Mành',
    address: '1 Hàng Mành, Hàng Gai, Hoàn Kiếm, Hà Nội',
    lat: 21.0338,
    lng: 105.8492,
    diningTypes: ['meal'],
    priceMin: 70000,
    priceMax: 120000,
    description: 'Bún chả truyền thống nhiều thịt, nem cua bể giòn rụm đậm chất ẩm thực Hà Thành.',
    companions: [
      { id: 'friends', score: 90 },
      { id: 'couple', score: 80 },
      { id: 'solo', score: 75 },
    ],
    foods: ['Bún chả suất đặc biệt', 'Nem cua bể'],
  },
  {
    name: 'Chả Cá Lã Vọng',
    address: '14 Chả Cá, Hàng Bồ, Hoàn Kiếm, Hà Nội',
    lat: 21.0366,
    lng: 105.8499,
    diningTypes: ['meal'],
    priceMin: 180000,
    priceMax: 300000,
    description: 'Món chả cá lăng nướng trên chảo mỡ sôi cùng thì là, hành hoa ăn kèm mắm tôm nức tiếng hơn một thế kỷ.',
    companions: [
      { id: 'couple', score: 95 },
      { id: 'friends', score: 90 },
      { id: 'solo', score: 60 },
    ],
    foods: ['Chả cá lăng gia truyền', 'Lòng cá xào'],
  },
  {
    name: 'Bún Đậu Ngõ Trạm',
    address: '1B Ngõ Trạm, Hàng Bông, Hoàn Kiếm, Hà Nội',
    lat: 21.0315,
    lng: 105.8465,
    diningTypes: ['meal'],
    priceMin: 45000,
    priceMax: 90000,
    description: 'Mẹt bún đậu đầy đặn với chả cốm nóng giòn, thịt chân giò luộc và dồi rán thơm bùi.',
    companions: [
      { id: 'friends', score: 95 },
      { id: 'couple', score: 85 },
      { id: 'solo', score: 80 },
    ],
    foods: ['Bún đậu mẹt đầy đủ', 'Chả cốm chiên giòn'],
  },
  {
    name: 'Bún Riêu Cua Hàng Bạc',
    address: '11 Hàng Bạc, Hàng Bạc, Hoàn Kiếm, Hà Nội',
    lat: 21.0350,
    lng: 105.8525,
    diningTypes: ['meal'],
    priceMin: 40000,
    priceMax: 65000,
    description: 'Bát bún riêu cua chuẩn vị gạch cua đồng xịn, nước dùng chua thanh vị giấm bỗng.',
    companions: [
      { id: 'solo', score: 95 },
      { id: 'friends', score: 80 },
      { id: 'couple', score: 75 },
    ],
    foods: ['Bún riêu cua giò bò', 'Ốc nhồi'],
  },
  {
    name: 'Xôi Yến Nguyễn Hữu Huân',
    address: '35B Nguyễn Hữu Huân, Lý Thái Tổ, Hoàn Kiếm, Hà Nội',
    lat: 21.0335,
    lng: 105.8540,
    diningTypes: ['meal'],
    priceMin: 35000,
    priceMax: 70000,
    description: 'Xôi xéo, xôi ngô dẻo thơm rưới mỡ hành, hành phi giòn tan kết hợp thịt kho trứng béo ngậy.',
    companions: [
      { id: 'solo', score: 90 },
      { id: 'friends', score: 85 },
      { id: 'couple', score: 80 },
    ],
    foods: ['Xôi xéo thịt kho trứng', 'Xôi ngô patê lạp xưởng'],
  },
  {
    name: 'Phở Cuốn Hương Mai Ngũ Xã',
    address: '25 Ngũ Xã, Trúc Bạch, Ba Đình, Hà Nội',
    lat: 21.0465,
    lng: 105.8415,
    diningTypes: ['meal', 'snack'],
    priceMin: 60000,
    priceMax: 120000,
    description: 'Làng ẩm thực Ngũ Xã nổi danh món phở cuốn thịt bò rau thơm chấm nước mắm chua ngọt thanh mát.',
    companions: [
      { id: 'friends', score: 95 },
      { id: 'couple', score: 90 },
      { id: 'solo', score: 70 },
    ],
    foods: ['Phở cuốn thịt bò', 'Phở chiên phồng', 'Phở chiên trứng'],
  },
  {
    name: 'Bánh Cuốn Bà Hoành',
    address: '66 Tô Hiến Thành, Bùi Thị Xuân, Hai Bà Trưng, Hà Nội',
    lat: 21.0135,
    lng: 105.8512,
    diningTypes: ['meal'],
    priceMin: 40000,
    priceMax: 75000,
    description: 'Bánh cuốn tráng mỏng thanh mát ăn cùng chả quế nướng thơm lừng.',
    companions: [
      { id: 'couple', score: 85 },
      { id: 'solo', score: 85 },
      { id: 'friends', score: 80 },
    ],
    foods: ['Bánh cuốn chả quế', 'Cà cuống hấp'],
  },
  {
    name: 'Cơm Gà Bà Buội Hà Nội',
    address: '66 Bà Triệu, Hàng Bài, Hoàn Kiếm, Hà Nội',
    lat: 21.0205,
    lng: 105.8520,
    diningTypes: ['meal'],
    priceMin: 65000,
    priceMax: 120000,
    description: 'Cơm gà chuẩn gốc Hội An giữa lòng Hà Nội với gà ta thả vườn thịt chắc da giòn.',
    companions: [
      { id: 'couple', score: 90 },
      { id: 'friends', score: 85 },
      { id: 'solo', score: 80 },
    ],
    foods: ['Cơm gà xé', 'Gỏi gà hoa chuối'],
  },

  // --- ĂN VẶT & ĐỒ UỐNG (SNACK) ---
  {
    name: 'Kem Tràng Tiền Chính Gốc',
    address: '35 Tràng Tiền, Tràng Tiền, Hoàn Kiếm, Hà Nội',
    lat: 21.0253,
    lng: 105.8573,
    diningTypes: ['snack'],
    priceMin: 15000,
    priceMax: 45000,
    description: 'Thương hiệu kem biểu tượng gắn liền với ký ức người dân Hà Nội, nằm ngay cạnh Hồ Gươm.',
    companions: [
      { id: 'couple', score: 98 },
      { id: 'friends', score: 95 },
      { id: 'solo', score: 80 },
    ],
    foods: ['Kem ốc quế vani', 'Kem que cốm sữa', 'Kem mochi đậu xanh'],
  },
  {
    name: 'Trà Chanh Chợ Gạo Phố Cổ',
    address: '1 Chợ Gạo, Hàng Buồm, Hoàn Kiếm, Hà Nội',
    lat: 21.0362,
    lng: 105.8535,
    diningTypes: ['snack'],
    priceMin: 20000,
    priceMax: 40000,
    description: 'Điểm tụ tập chém gió buổi tối quen thuộc của giới trẻ Hà Nội với trà chanh, hướng dương.',
    companions: [
      { id: 'friends', score: 98 },
      { id: 'couple', score: 85 },
      { id: 'solo', score: 70 },
    ],
    foods: ['Trà chanh đào', 'Hướng dương ngũ vị'],
  },
  {
    name: 'Nem Chua Rán Ngõ Tạm Thương',
    address: '36 Ngõ Tạm Thương, Hàng Gai, Hoàn Kiếm, Hà Nội',
    lat: 21.0310,
    lng: 105.8480,
    diningTypes: ['snack'],
    priceMin: 30000,
    priceMax: 70000,
    description: 'Thiên đường nem chua rán giòn rụm trong ngõ nhỏ, ăn kèm xoài lắc và tương ớt cay nồng.',
    companions: [
      { id: 'friends', score: 95 },
      { id: 'couple', score: 90 },
      { id: 'solo', score: 70 },
    ],
    foods: ['Nem chua rán giòn', 'Khoai tây lắc phô mai'],
  },
  {
    name: 'Ốc Nóng Hà Trang Đinh Liệt',
    address: '1 Đinh Liệt, Hàng Bạc, Hoàn Kiếm, Hà Nội',
    lat: 21.0330,
    lng: 105.8532,
    diningTypes: ['snack', 'drinking'],
    priceMin: 40000,
    priceMax: 100000,
    description: 'Quán ốc luộc lá bưởi nổi tiếng phố cổ với bát nước chấm gừng sả ớt thần thánh.',
    companions: [
      { id: 'friends', score: 95 },
      { id: 'couple', score: 85 },
      { id: 'solo', score: 65 },
    ],
    foods: ['Ốc vặn luộc lá bưởi', 'Ngao hấp sả ớt'],
  },
  {
    name: 'Bánh Tôm Hồ Tây',
    address: '1 Thanh Niên, Yên Phụ, Tây Hồ, Hà Nội',
    lat: 21.0495,
    lng: 105.8368,
    diningTypes: ['snack', 'meal'],
    priceMin: 50000,
    priceMax: 150000,
    description: 'Thưởng thức bánh tôm giòn bùi và ngắm hoàng hôn Hồ Tây lộng gió.',
    companions: [
      { id: 'couple', score: 95 },
      { id: 'friends', score: 90 },
      { id: 'solo', score: 70 },
    ],
    foods: ['Bánh tôm Hồ Tây truyền thống', 'Lẩu riêu cua'],
  },
  {
    name: 'Bánh Tráng Trộn Cô Toàn Đống Đa',
    address: 'A11 Tôn Thất Tùng, Trung Tự, Đống Đa, Hà Nội',
    lat: 21.0068,
    lng: 105.8325,
    diningTypes: ['snack'],
    priceMin: 25000,
    priceMax: 45000,
    description: 'Quán bánh tráng trộn nườm nượp học sinh sinh viên khu vực Đại học Y.',
    companions: [
      { id: 'friends', score: 95 },
      { id: 'couple', score: 85 },
      { id: 'solo', score: 80 },
    ],
    foods: ['Bánh tráng trộn bò khô trứng cút', 'Bánh tráng nướng phô mai'],
  },
  {
    name: 'Trà Sữa Đô Đô Cầu Giấy',
    address: '14 Hồ Tùng Mậu, Mai Dịch, Cầu Giấy, Hà Nội',
    lat: 21.0380,
    lng: 105.7790,
    diningTypes: ['snack'],
    priceMin: 25000,
    priceMax: 40000,
    description: 'Trà sữa đồng giá với topping mochi kéo sợi béo ngậy được giới trẻ yêu thích.',
    companions: [
      { id: 'couple', score: 90 },
      { id: 'friends', score: 90 },
      { id: 'solo', score: 85 },
    ],
    foods: ['Trà sữa mochi kéo sợi', 'Trà đào cam sả'],
  },

  // --- ĐI NHẬU & LAI RAI (DRINKING) ---
  {
    name: 'Quán Nhậu Tự Do Nguyễn Văn Huyên',
    address: '10 Nguyễn Văn Huyên, Dịch Vọng, Cầu Giấy, Hà Nội',
    lat: 21.0375,
    lng: 105.7952,
    diningTypes: ['drinking', 'meal'],
    priceMin: 150000,
    priceMax: 350000,
    description: 'Chuỗi quán nhậu sân vườn thoáng đãng, bia mát lạnh cùng menu mồi bén phong phú.',
    companions: [
      { id: 'friends', score: 98 },
      { id: 'couple', score: 75 },
      { id: 'solo', score: 40 },
    ],
    foods: ['Bò nướng tảng sốt tiêu xanh', 'Bê chao Mộc Châu', 'Lẩu riêu cua sườn sụn'],
  },
  {
    name: 'Bia Hơi Hải Xồm Lê Trọng Tấn',
    address: '86 Lê Trọng Tấn, Khương Mai, Thanh Xuân, Hà Nội',
    lat: 20.9995,
    lng: 105.8305,
    diningTypes: ['drinking'],
    priceMin: 120000,
    priceMax: 250000,
    description: 'Quán bia hơi chuẩn phong cách vỉa hè Hà Nội, bia tươi rói rói và các món nhắm bình dân.',
    companions: [
      { id: 'friends', score: 98 },
      { id: 'solo', score: 60 },
      { id: 'couple', score: 50 },
    ],
    foods: ['Bia hơi Hà Nội tươi', 'Mực xào cần tỏi', 'Dồi mơ chiên giòn'],
  },
  {
    name: 'Bia Thu Hằng Nguyễn Khánh Toàn',
    address: '68 Nguyễn Khánh Toàn, Quan Hoa, Cầu Giấy, Hà Nội',
    lat: 21.0365,
    lng: 105.7985,
    diningTypes: ['drinking'],
    priceMin: 130000,
    priceMax: 280000,
    description: 'Địa điểm cụng ly quen thuộc của anh em Cầu Giấy sau giờ tan tầm.',
    companions: [
      { id: 'friends', score: 98 },
      { id: 'solo', score: 50 },
      { id: 'couple', score: 50 },
    ],
    foods: ['Bia hơi Hà Nội', 'Bê thui Cầu Mống', 'Lạc luộc'],
  },
  {
    name: 'Bò Nướng Xuân Xuân Mã Mây',
    address: '47 Mã Mây, Hàng Buồm, Hoàn Kiếm, Hà Nội',
    lat: 21.0358,
    lng: 105.8528,
    diningTypes: ['drinking', 'meal'],
    priceMin: 100000,
    priceMax: 220000,
    description: 'Bò nướng vỉa hè phố cổ thơm nức mùi bơ tỏi, lai rai ngắm phố xá đêm.',
    companions: [
      { id: 'friends', score: 95 },
      { id: 'couple', score: 85 },
      { id: 'solo', score: 50 },
    ],
    foods: ['Bò nầm nướng chảo bơ', 'Bia Trúc Bạch'],
  },
  {
    name: 'Ngan Cháy Tỏi Hàng Thiếc',
    address: '71 Hàng Thiếc, Hàng Gai, Hoàn Kiếm, Hà Nội',
    lat: 21.0345,
    lng: 105.8485,
    diningTypes: ['drinking', 'meal'],
    priceMin: 80000,
    priceMax: 200000,
    description: 'Thịt ngan áp chảo ngập tỏi phi thơm nức mũi ăn kèm canh măng tiết và bún.',
    companions: [
      { id: 'friends', score: 95 },
      { id: 'couple', score: 85 },
      { id: 'solo', score: 70 },
    ],
    foods: ['Ngan cháy tỏi đặc sản', 'Canh măng tiết'],
  },
  {
    name: 'Lẩu Dê Nhất Ly Dã Tượng',
    address: '15 Dã Tượng, Trần Hưng Đạo, Hoàn Kiếm, Hà Nội',
    lat: 21.0210,
    lng: 105.8465,
    diningTypes: ['drinking', 'meal'],
    priceMin: 180000,
    priceMax: 350000,
    description: 'Thịt dê ré tươi nướng tảng và lẩu dê thuốc bắc thơm lừng bổ dưỡng.',
    companions: [
      { id: 'friends', score: 95 },
      { id: 'couple', score: 85 },
      { id: 'solo', score: 50 },
    ],
    foods: ['Dê nướng tảng ngũ vị', 'Lẩu dê thuốc bắc'],
  },
  {
    name: 'Lẩu Nấm Ashima Triệu Việt Vương',
    address: '182 Triệu Việt Vương, Bùi Thị Xuân, Hai Bà Trưng, Hà Nội',
    lat: 21.0115,
    lng: 105.8510,
    diningTypes: ['meal', 'drinking'],
    priceMin: 250000,
    priceMax: 500000,
    description: 'Không gian lãng mạn sang trọng với canh nấm quý thanh tao bồi bổ sức khỏe.',
    companions: [
      { id: 'couple', score: 98 },
      { id: 'friends', score: 85 },
      { id: 'solo', score: 60 },
    ],
    foods: ['Lẩu nấm quý thảo dược', 'Bò Wagyu thượng hạng'],
  },
  {
    name: 'Bia Hơi Cường Hói Hồ Tây',
    address: '1 Trích Sài, Thụy Khuê, Tây Hồ, Hà Nội',
    lat: 21.0475,
    lng: 105.8285,
    diningTypes: ['drinking'],
    priceMin: 130000,
    priceMax: 270000,
    description: 'Quán bia ven Hồ Tây gió lộng, view hồ thoáng đãng cùng hải sản tươi ngon.',
    companions: [
      { id: 'friends', score: 98 },
      { id: 'couple', score: 70 },
      { id: 'solo', score: 50 },
    ],
    foods: ['Bia hơi cốc vại', 'Mực một nắng nướng sa tế', 'Gà nướng lu'],
  },
];

async function seedRealHanoi() {
  console.log(`[Import] Bắt đầu nạp ${REAL_HANOI_RESTAURANTS.length} quán ăn thật tại Hà Nội vào database Neon...`);

  let count = 0;

  for (const item of REAL_HANOI_RESTAURANTS) {
    const slug = slugify(item.name);

    // 1. Create or update restaurant
    const r = await prisma.restaurant.upsert({
      where: { slug },
      update: {
        name: item.name,
        address: item.address,
        latitude: item.lat,
        longitude: item.lng,
        priceMin: item.priceMin,
        priceMax: item.priceMax,
        status: 'PUBLISHED',
        description: item.description,
      },
      create: {
        name: item.name,
        slug,
        address: item.address,
        latitude: item.lat,
        longitude: item.lng,
        priceMin: item.priceMin,
        priceMax: item.priceMax,
        status: 'PUBLISHED',
        description: item.description,
      },
    });

    // 2. Link dining types
    for (const dtId of item.diningTypes) {
      await prisma.restaurantDiningType.upsert({
        where: {
          restaurantId_diningTypeId: {
            restaurantId: r.id,
            diningTypeId: dtId,
          },
        },
        update: {},
        create: {
          restaurantId: r.id,
          diningTypeId: dtId,
        },
      });
    }

    // 3. Link companion types
    for (const c of item.companions) {
      await prisma.restaurantCompanionType.upsert({
        where: {
          restaurantId_companionTypeId: {
            restaurantId: r.id,
            companionTypeId: c.id,
          },
        },
        update: { suitabilityScore: c.score },
        create: {
          restaurantId: r.id,
          companionTypeId: c.id,
          suitabilityScore: c.score,
        },
      });
    }

    // 4. Link foods
    for (const foodName of item.foods) {
      const foodSlug = slugify(foodName);
      const food = await prisma.food.upsert({
        where: { slug: foodSlug },
        update: { name: foodName },
        create: {
          name: foodName,
          slug: foodSlug,
          category: item.diningTypes[0] === 'snack' ? 'Ăn vặt & Đồ uống' : (item.diningTypes[0] === 'drinking' ? 'Món nhậu' : 'Món chính'),
        },
      });

      await prisma.restaurantFood.upsert({
        where: {
          restaurantId_foodId: {
            restaurantId: r.id,
            foodId: food.id,
          },
        },
        update: {},
        create: {
          restaurantId: r.id,
          foodId: food.id,
          priceVnd: item.priceMin,
        },
      });
    }

    count++;
  }

  console.log(`[Thành công] Đã nạp thành công ${count} quán ăn thật tại Hà Nội vào Neon PostgreSQL!`);
}

seedRealHanoi()
  .catch((e) => {
    console.error('[Lỗi import]', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
