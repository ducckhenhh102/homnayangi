import { Router } from 'express';

const router = Router();

// Hanoi districts & popular landmark dictionary for instant accurate fallback
const HANOI_GEO_DICTIONARY = [
  { keywords: ['hoan kiem', 'hoàn kiếm', 'bo ho', 'bờ hồ', 'pho co', 'phố cổ', 'ta hien', 'tạ hiện', 'bat dan', 'bát đàn', 'hang bac', 'hàng bạc', 'ly quoc su', 'lý quốc sư'], lat: 21.0285, lng: 105.8544, name: 'Hoàn Kiếm, Hà Nội' },
  { keywords: ['ba dinh', 'ba đình', 'truc bach', 'trúc bạch', 'ngu xa', 'ngũ xã', 'lieu giai', 'liễu giai', 'doi can', 'đội cấn', 'kim ma', 'kim mã', 'giang vo', 'giảng võ'], lat: 21.0341, lng: 105.8286, name: 'Ba Đình, Hà Nội' },
  { keywords: ['dong da', 'đống đa', 'chua lang', 'chùa láng', 'thai thinh', 'thái thịnh', 'o cho dua', 'ô chợ dừa', 'ton duc thang', 'tôn đức thắng', 'xa dan', 'xã đàn', 'chua boc', 'chùa bộc'], lat: 21.0185, lng: 105.8236, name: 'Đống Đa, Hà Nội' },
  { keywords: ['cau giay', 'cầu giấy', 'xuan thuy', 'xuân thủy', 'duy tan', 'duy tân', 'to hieu', 'tô hiệu', 'dich vong', 'dịch vọng', 'nguyen phong sac', 'nguyễn phong sắc', 'trung hoa', 'trung hòa'], lat: 21.0362, lng: 105.7906, name: 'Cầu Giấy, Hà Nội' },
  { keywords: ['tay ho', 'tây hồ', 'yen phu', 'yên phụ', 'quang an', 'quảng an', 'xuan dieu', 'xuân diệu', 'nhat tan', 'nhật tân', 'thuy khue', 'thụy khuê'], lat: 21.0583, lng: 105.8194, name: 'Tây Hồ, Hà Nội' },
  { keywords: ['hai ba trung', 'hai bà trưng', 'pho hue', 'phố huế', 'ba trieu', 'bà triệu', 'bach mai', 'bạch mai', 'tran dai nghia', 'trần đại nghĩa', 'dai co viet', 'đại cồ việt', 'time city', 'times city'], lat: 21.0089, lng: 105.8524, name: 'Hai Bà Trưng, Hà Nội' },
  { keywords: ['thanh xuan', 'thanh xuân', 'nguyen trai', 'nguyễn trãi', 'le van luong', 'lê văn lương', 'khuong dinh', 'khương đình', 'royal city'], lat: 20.9937, lng: 105.8105, name: 'Thanh Xuân, Hà Nội' },
  { keywords: ['nam tu liem', 'nam từ liêm', 'my dinh', 'mỹ đình', 'me tri', 'mễ trì', 'le duc tho', 'lê đức thọ', 'ham nghi', 'hàm nghi'], lat: 21.0175, lng: 105.7725, name: 'Nam Từ Liêm, Hà Nội' },
  { keywords: ['bac tu liem', 'bắc từ liêm', 'co nhue', 'cổ nhuế', 'xuan dinh', 'xuân đỉnh', 'nhon', 'nhổn'], lat: 21.0641, lng: 105.7583, name: 'Bắc Từ Liêm, Hà Nội' },
  { keywords: ['ha dong', 'hà đông', 'van quan', 'văn quán', 'mo lao', 'mỗ lao', 'quang trung ha dong', 'quang trung hà đông', 'la khe', 'la khê'], lat: 20.9721, lng: 105.7766, name: 'Hà Đông, Hà Nội' },
  { keywords: ['hoang mai', 'hoàng mai', 'dinh cong', 'định công', 'linh dam', 'linh đàm', 'giai phong', 'giải phóng', 'tam trinh', 'tam trinh'], lat: 20.9754, lng: 105.8524, name: 'Hoàng Mai, Hà Nội' },
  { keywords: ['long bien', 'long biên', 'ngoc lam', 'ngọc lâm', 'bo de', 'bồ đề', 'aeon mall long bien', 'aeon mall long biên'], lat: 21.0427, lng: 105.8893, name: 'Long Biên, Hà Nội' },
];

function normalizeStr(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .trim();
}

router.get('/geocode', async (req, res) => {
  const q = req.query.q;
  if (!q || typeof q !== 'string' || !q.trim()) {
    return res.status(400).json({
      error: { code: 'INVALID_QUERY', message: 'Vui lòng cung cấp địa chỉ hoặc tên khu vực cần tìm.' },
    });
  }

  const queryRaw = q.trim();
  const queryNormalized = normalizeStr(queryRaw);

  // 1. Try dictionary lookup first (instant response, zero external latency)
  for (const entry of HANOI_GEO_DICTIONARY) {
    const matched = entry.keywords.some((kw) => {
      const normKw = normalizeStr(kw);
      return queryNormalized.includes(normKw) || normKw.includes(queryNormalized);
    });
    if (matched) {
      return res.status(200).json({
        data: {
          lat: entry.lat,
          lng: entry.lng,
          displayName: `${queryRaw} (${entry.name})`,
          source: 'dictionary',
        },
      });
    }
  }

  // 2. Try OpenStreetMap Nominatim with server-side timeout
  try {
    let searchParam = queryRaw;
    if (!queryNormalized.includes('ha noi') && !queryNormalized.includes('hanoi')) {
      searchParam += ', Hà Nội, Việt Nam';
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchParam)}&limit=1&countrycodes=vn`;
    const response = await fetch(nominatimUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'HomNayAnGi-App/1.0 (contact: admin@homnayangi.vn)',
        'Accept-Language': 'vi,en;q=0.8',
      },
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const results = await response.json();
      if (Array.isArray(results) && results.length > 0) {
        return res.status(200).json({
          data: {
            lat: parseFloat(results[0].lat),
            lng: parseFloat(results[0].lon),
            displayName: results[0].display_name,
            source: 'nominatim',
          },
        });
      }
    }
  } catch (err) {
    // If Nominatim timed out or failed, log and fallback
    console.warn('[Geocode] Nominatim search failed or timed out:', err.message);
  }

  // 3. Fallback to Central Hanoi (Hoàn Kiếm) if query looks like Hanoi
  if (queryNormalized.includes('ha noi') || queryNormalized.includes('hanoi')) {
    return res.status(200).json({
      data: {
        lat: 21.0285,
        lng: 105.8544,
        displayName: `${queryRaw} (Khu vực trung tâm Hà Nội)`,
        source: 'hanoi_center_fallback',
      },
    });
  }

  return res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Không tìm thấy tọa độ cho địa chỉ này. Hãy thử nhập tên quận/phố (ví dụ: Cầu Giấy, Hoàn Kiếm, Bát Đàn) hoặc bấm trực tiếp trên bản đồ.',
    },
  });
});

export default router;
