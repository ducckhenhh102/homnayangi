# HYBRID PLACES — Admin + External Places Provider

> Thiết kế tích hợp dữ liệu quán ăn từ Neon và nhà cung cấp địa điểm bên ngoài. **Đọc điều khoản dịch vụ hiện hành của provider trước khi triển khai.**

## 1. Mục tiêu

- Kết hợp quán tự quản lý (đầy đủ metadata nội bộ) với quán từ Places API.
- Tìm trong **bán kính địa lý tối đa 10 km** quanh vị trí đã chọn.
- Tránh trùng, không bịa dữ liệu, hiển thị nguồn và tuân thủ giấy phép.
- API ngoài lỗi vẫn sử dụng được quán nội bộ.

## 2. Lựa chọn provider

- MVP đề xuất: adapter `GooglePlacesProvider` cho Google Places API (New), sau khi bật billing, thiết lập quota/budget và kiểm tra chính sách.
- Không coi Google Places là cơ sở dữ liệu miễn phí, không giới hạn.
- Có thể thay provider khác bằng adapter, nhưng phải kiểm tra coverage, giấy phép dữ liệu, bản đồ, ảnh và lưu trữ.
- Leaflet + tiles khác Google **không mặc nhiên được phép** dùng để hiển thị mọi dữ liệu Google Places trên bản đồ; xác minh điều khoản và chọn map renderer tương thích trước khi bật lớp điểm ngoài.

## 3. Interface adapter

```js
// backend/src/integrations/places/placesProvider.js
// Định nghĩa contract, không chứa secret trong frontend.
export class PlacesProvider {
  async searchNearby({ lat, lng, radiusKm, diningType }) {
    throw new Error('Not implemented');
  }
  async getPlaceDetails(providerPlaceId) {
    throw new Error('Not implemented');
  }
}
```

Adapter thực tế cần request timeout, field mask tối thiểu, quota handling, retry hạn chế, attribution và mapping danh mục. Không đưa raw provider response thẳng về client.

## 4. Discovery pipeline

```text
Validate input (Zod)
  -> fetch internal restaurants (Neon) --+
  -> fetch external places (provider) ---+  [parallel + timeout]
  -> normalize fields + preserve attribution
  -> deduplicate (verified provider ID first)
  -> filter <= radiusKm + diningType
  -> rank by companion suitability / distance
  -> paginate + return meta.partialResults
```

**Chú ý:** Một Places Nearby Search có thể giới hạn số lượng kết quả và phân trang; không được tuyên bố đã tìm **tất cả** quán trong 10 km nếu API không bảo đảm độ bao phủ. Giao diện nên ghi “Các quán tìm thấy” thay vì “Toàn bộ quán”.

## 5. Chuẩn hóa model

```js
{
  id: 'google:<provider-place-id>',
  source: 'google',
  providerPlaceId: '<provider-place-id>',
  name: 'Tên do provider trả về',
  address: 'Địa chỉ do provider trả về',
  location: { lat: 0, lng: 0 },
  distanceKm: 0,
  diningTypes: [],        // ánh xạ có độ tin cậy, có thể rỗng
  companionTypes: [],     // không tự đoán là sự thật
  priceMin: null,
  priceMax: null,
  rating: null,
  isOpen: null,
  imageUrl: null,
  attribution: { provider: 'google', text: null, url: null }
}
```

Các giá trị trên là **schema ví dụ**, không phải địa điểm thực. `distanceKm` được tính từ tọa độ tìm kiếm, không phải provider tự bảo đảm. Với `isOpen`, cần thời điểm lấy dữ liệu và độ tin cậy.

## 6. Phân loại 3 nhóm ăn

| Dining type | Tín hiệu gợi ý | Cẩn trọng |
|---|---|---|
| `snack` | Dessert, cafe, snack, tea, street food | Cafe có thể phục vụ bữa chính |
| `meal` | Restaurant, noodle, rice, fast food | Một quán có thể vừa ăn vừa nhậu |
| `drinking` | Pub, bar, beer garden, quán nhậu | Không đồng nhất tất cả bar với quán ăn |

Đây là **heuristics**, không phải sự thật tuyệt đối. Lưu `classificationConfidence`, cho phép admin override với quán nội bộ. Khi phân loại không chắc chắn, để `unknown` và không đưa vào bộ lọc nghiêm ngặt nếu người dùng đã chọn kiểu ăn.

## 7. Deduplication

Ưu tiên theo thứ tự:
1. Khớp `provider + providerPlaceId` đã được admin xác minh.
2. Tên chuẩn hóa + khoảng cách rất gần + địa chỉ tương đồng -> **đề xuất trùng**, không tự merge nếu thiếu tin cậy.
3. Nếu chưa chắc, giữ hai bản ghi và đánh dấu để review; tránh gộp hai chi nhánh cùng thương hiệu.

Khi xác minh trùng, bản ghi nội bộ là canonical, nhưng dữ liệu provider vẫn phải giữ nguồn/attribution và chỉ dùng trong giới hạn cho phép.

## 8. Lưu trữ, caching và quyền sử dụng

- **Neon**: lưu dữ liệu do admin sở hữu/được cấp quyền, cấu hình provider, mapping nội bộ, liên kết ID khi được phép.
- **Provider data**: không tự động sao chép toàn bộ, không lưu ảnh/reviews/giờ mở cửa/rating lâu dài nếu điều khoản không cho phép.
- Cache: thời gian sống, loại dữ liệu, nơi lưu và chính sách refresh phải dựa trên điều khoản hiện hành của provider; không áp đặt một TTL chung tùy ý.
- Ghi attribution và hiển thị logo/link theo quy định của từng dịch vụ.
- Tọa độ GPS của người dùng không lưu dài hạn nếu không cần; không gửi vào analytics không có đồng ý phù hợp.
- API key đặt ở Vercel server env, áp dụng hạn chế key theo khả năng của provider, quota, budget alerts.

## 9. Failure modes

| Trường hợp | Hành vi |
|---|---|
| Provider timeout/5xx | Dùng quán nội bộ, `partialResults=true` |
| Quota/billing hết | Không retry liên tục; thông báo kết quả chưa đầy đủ |
| Không có quán | Empty state + đổi vị trí/kiểu ăn |
| Thiếu tọa độ | Loại khỏi nearby và wheel |
| GPS denied | Cho nhập/chọn địa điểm |
| Không xác định dining type | Không tự khẳng định phù hợp |
| Kết quả trùng chưa chắc | Không merge tự động |
| Thiếu ảnh/giá/rating | Placeholder hoặc null, không bịa |

## 10. Kiểm thử tích hợp

- Mock provider success, empty, timeout, 429, 500, malformed response.
- Tính Haversine tại biên 10 km, vĩ độ âm, kinh độ âm, gần ±180°.
- Không đưa quán ngoài bán kính vào danh sách/vòng quay.
- Dedup verified ID, khác chi nhánh, tên giống nhưng địa chỉ khác.
- Kiểm tra attribution và xử lý field thiếu.
- Test bảo mật: secret không có trong frontend bundle; API rate limit; validation tọa độ.

## 11. Checklist trước production

- [ ] Chọn provider và đọc tài liệu/điều khoản hiện hành.
- [ ] Xác nhận cách hiển thị bản đồ và attribution hợp lệ.
- [ ] Bật billing, quota, giới hạn ngân sách và cảnh báo.
- [ ] Chỉ request trường cần thiết; kiểm tra chi phí từng endpoint.
- [ ] Có fallback nội bộ, timeout, circuit breaker hoặc retry giới hạn.
- [ ] Không lưu dữ liệu/ảnh bên ngoài trái phép.
- [ ] Có privacy notice cho GPS và dữ liệu địa điểm.


## 12. Google Places API (New) – triển khai cụ thể

- Endpoint: `POST https://places.googleapis.com/v1/places:searchNearby`.
- Header bí mật `X-Goog-Api-Key` chỉ gửi từ backend; `X-Goog-FieldMask` chọn đúng field cần dùng; các field có SKU/giá khác nhau.
- Body dùng `locationRestriction.circle.center` và `radius` **tính bằng mét** (ví dụ 10000 cho 10 km). `maxResultCount` giới hạn **1–20**, không phải API liệt kê toàn bộ khu vực.
- Không đặt `diningType=drinking` đồng nghĩa với bán đồ uống có cồn; category mapping chỉ là gợi ý, không phải xác minh thực tế.
- Khi hiển thị điểm trả từ Google Places lên **bản đồ**, phải dùng **Google Map** cùng attribution. Chỉ hiển thị dạng danh sách không có bản đồ vẫn cần Google Maps attribution/logo và attribution bên thứ ba khi yêu cầu.
- Không chuyển tên, địa chỉ, tọa độ, ảnh, review Google Places thành bản ghi quản trị nội bộ để lưu lâu dài. Place ID được lưu theo ngoại lệ chính sách; xem kỹ ngoại lệ có thời hạn cho tọa độ nếu thật sự cần.
- Không upload ảnh Google Places lên Cloudinary hoặc dùng Google Places để tự xây database địa điểm riêng.
- Dự án có `PLACES_ENABLED=false` để tiếp tục phát triển **miễn phí** với dữ liệu nội bộ, sau đó bật provider khi đã thiết lập billing/quota/attribution.

### Ví dụ request phía backend (minh họa, không chứa API key)

```http
POST https://places.googleapis.com/v1/places:searchNearby
Content-Type: application/json
X-Goog-FieldMask: places.id,places.displayName,places.location,places.types
X-Goog-Api-Key: ${GOOGLE_PLACES_API_KEY}

{
  "includedTypes": ["restaurant"],
  "maxResultCount": 20,
  "rankPreference": "DISTANCE",
  "locationRestriction": {
    "circle": {
      "center": { "latitude": 21.0285, "longitude": 105.8542 },
      "radius": 10000
    }
  }
}
```

**Nguồn cần kiểm tra khi đổi phiên bản:**
- https://developers.google.com/maps/documentation/places/web-service/nearby-search
- https://developers.google.com/maps/documentation/places/web-service/policies
- https://developers.google.com/maps/billing-and-pricing/pricing
