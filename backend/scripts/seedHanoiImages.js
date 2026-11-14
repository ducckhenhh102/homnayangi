import prisma from '../src/config/db.js';

const HANOI_IMAGE_MAPPING = {
  'pho-gia-truyen-bat-dan': {
    url: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop&q=80',
    alt: 'Bát phở bò gia truyền Bát Đàn nóng hổi',
  },
  'pho-10-ly-quoc-su': {
    url: 'https://images.unsplash.com/photo-1576577445504-6af96477db52?w=800&auto=format&fit=crop&q=80',
    alt: 'Phở bò đặc biệt Lý Quốc Sư',
  },
  'bun-cha-dac-kim-hang-manh': {
    url: 'https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?w=800&auto=format&fit=crop&q=80',
    alt: 'Suất bún chả nem cua bể Hàng Mành',
  },
  'cha-ca-la-vong': {
    url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80',
    alt: 'Chảo chả cá lăng Lã Vọng thơm nức thì là',
  },
  'bun-dau-ngo-tram': {
    url: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=800&auto=format&fit=crop&q=80',
    alt: 'Mẹt bún đậu chả cốm Ngõ Trạm',
  },
  'bun-rieu-cua-hang-bac': {
    url: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800&auto=format&fit=crop&q=80',
    alt: 'Bát bún riêu cua Hàng Bạc đậm vị',
  },
  'banh-cuon-gia-an': {
    url: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800&auto=format&fit=crop&q=80',
    alt: 'Đĩa bánh cuốn nóng rắc hành phi giòn',
  },
  'com-tam-sa-bi-chuong': {
    url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&auto=format&fit=crop&q=80',
    alt: 'Dĩa cơm tấm sườn bì chả đầy đặn',
  },
  'pho-cuon-huong-mai': {
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
    alt: 'Đĩa phở cuốn thịt bò Ngũ Xã',
  },
  'mi-ga-tan-hang-bo': {
    url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80',
    alt: 'Bát mì gà tần thuốc bắc Hàng Bồ',
  },
  'bun-bo-hue-o-xuan': {
    url: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=800&auto=format&fit=crop&q=80',
    alt: 'Tô bún bò Huế O Xuân cay nồng đậm đà',
  },
  'nem-chua-ran-tam-thuong': {
    url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80',
    alt: 'Đĩa nem chua rán nóng giòn ngõ Tạm Thương',
  },
  'nom-bo-kho-long-vi-dung': {
    url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
    alt: 'Đĩa nộm bò khô chua ngọt phố Hồ Hoàn Kiếm',
  },
  'banh-mi-dan-to': {
    url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&auto=format&fit=crop&q=80',
    alt: 'Bánh mì Dân Tổ ngập tràn nhân xào thơm nức',
  },
  'che-bon-mua-hang-can': {
    url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80',
    alt: 'Bát chè sen nhãn Hàng Cân thanh mát',
  },
  'tra-chanh-nha-tho-lon': {
    url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80',
    alt: 'Cốc trà chanh và đĩa hạt hướng dương góc Nhà Thờ',
  },
  'cafe-giang-ca-phe-trung': {
    url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
    alt: 'Tách cà phê trứng Giảng béo ngậy thơm lừng',
  },
  'banh-ran-man-lac-long-quan': {
    url: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=800&auto=format&fit=crop&q=80',
    alt: 'Đĩa bánh rán mặn giòn rụm ngập nước sốt',
  },
  'tao-pho-jelly-bean': {
    url: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=800&auto=format&fit=crop&q=80',
    alt: 'Bát tào phớ nước đường hoa nhài thanh mát',
  },
  'bia-hoi-ha-noi-hai-xom': {
    url: 'https://images.unsplash.com/photo-1608270190538-4b711e63a152?w=800&auto=format&fit=crop&q=80',
    alt: 'Cốc bia hơi Hà Nội bọt trắng mát lạnh',
  },
  'quan-nhau-tu-do': {
    url: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800&auto=format&fit=crop&q=80',
    alt: 'Không gian tiệc tùng bạn bè tại Quán Nhậu Tự Do',
  },
  'lau-rieu-cua-bap-bo-pho-duc-chinh': {
    url: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&auto=format&fit=crop&q=80',
    alt: 'Nồi lẩu riêu cua bắp bò thơm lừng nóng hổi',
  },
  'chan-ga-nuong-ba-trieu': {
    url: 'https://images.unsplash.com/photo-1527477378408-1bc09c2a5c1a?w=800&auto=format&fit=crop&q=80',
    alt: 'Đĩa chân gà nướng than hoa mật ong vàng óng',
  },
  'long-ran-nhat-quan': {
    url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80',
    alt: 'Đĩa lòng rán giòn rụm chấm mắm tôm Nguyễn Siêu',
  },
  'bia-hoi-ta-hien': {
    url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80',
    alt: 'Không khí nhộn nhịp phố bia Tạ Hiện về đêm',
  },
  'banh-mi-25-hang-ca': {
    url: 'https://images.unsplash.com/photo-1600454309261-3dc9b7597637?w=800&auto=format&fit=crop&q=80',
    alt: 'Chiếc bánh mì 25 Hàng Cá vỏ giòn ruột mềm',
  },
};

async function seedImages() {
  console.log('[Ảnh quán ăn] Bắt đầu gán ảnh chất lượng cao cho các quán ăn Hà Nội...');
  const restaurants = await prisma.restaurant.findMany({
    select: { id: true, slug: true, name: true },
  });

  let updatedCount = 0;
  for (const r of restaurants) {
    const imgInfo = HANOI_IMAGE_MAPPING[r.slug] || {
      url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80',
      alt: `Món ngon tại quán ${r.name}`,
    };

    const publicId = `hanoi_seed_${r.slug}`;

    await prisma.restaurantImage.upsert({
      where: { cloudinaryPublicId: publicId },
      update: {
        secureUrl: imgInfo.url,
        altText: imgInfo.alt,
      },
      create: {
        restaurantId: r.id,
        cloudinaryPublicId: publicId,
        secureUrl: imgInfo.url,
        altText: imgInfo.alt,
        width: 800,
        height: 600,
        sortOrder: 0,
        rightsSource: 'Unsplash Curated Food Collection',
        uploadedBy: 'system_seed',
      },
    });

    updatedCount++;
  }

  console.log(`[Thành công] Đã gán ảnh thành công cho ${updatedCount} quán ăn tại Hà Nội!`);
}

seedImages()
  .catch((err) => {
    console.error('Lỗi gán ảnh:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
