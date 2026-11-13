# API Contract — Hôm Nay Ăn Gì?

> Base URL: `/api/v1` | JSON UTF-8 | Express trên Vercel Functions | API version 1

## 1. Quy ước chung

- Request và response dùng `camelCase`.
- Thành công: `{ "data": ..., "meta": ... }`; lỗi: `{ "error": { "code": "...", "message": "...", "details": ... } }`.
- HTTP status: `200` đọc, `201` tạo, `204` xóa/ẩn khi phù hợp, `400` invalid, `401` chưa xác thực, `403` thiếu quyền, `404` không thấy, `429` rate limit, `502/503` lỗi upstream.
- Validate input với Zod. API key ngoài và `DATABASE_URL` chỉ nằm trên server.
- `radiusKm`: mặc định **10**, cho phép `1..10` (không tự nâng lên quá 10).
- `lat` [-90,90], `lng` [-180,180]; `companion`: `couple|friends|solo`; `diningType`: `snack|meal|drinking`.
- Phân trang/giới hạn dữ liệu trả về; không trả tất cả quán trong một request không giới hạn.

## 2. Discovery

### `GET /restaurants/nearby`

Query: `lat`, `lng` (bắt buộc), `radiusKm=10`, `companion`, `diningType`, `page=1`, `limit=20`, `sort=relevance|distance`.

```http
GET /api/v1/restaurants/nearby?lat=21.0285&lng=105.8542&radiusKm=10&companion=couple&diningType=snack&page=1&limit=20
```

Response minh họa **hình dạng**, không phải quán thực tế:

```json
{
  "data": [
    {
      "id": "internal:example-id",
      "source": "internal",
      "name": "Quán minh họa",
      "address": "Địa chỉ minh họa",
      "location": { "lat": 21.0285, "lng": 105.8542 },
      "distanceKm": 0,
      "diningTypes": ["snack"],
      "companionTypes": ["couple", "friends"],
      "priceMin": null,
      "priceMax": null,
      "rating": null,
      "isOpen": null,
      "imageUrl": null,
      "attribution": null
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "radiusKm": 10,
    "partialResults": false,
    "sources": ["internal"]
  }
}
```

Nếu Places API lỗi, trả quán nội bộ và `meta.partialResults=true`; không trả lỗi toàn bộ khi còn dữ liệu nội bộ dùng được. Với kết quả ngoài, trả đúng attribution, link và metadata theo điều khoản provider.

### `GET /restaurants/:id`

ID có namespace, ví dụ `internal:<uuid>` hoặc `google:<placeId>`; route cần xử lý encode URL đúng cách. Chi tiết có thể gọi provider on-demand nếu được phép.

### `GET /foods`

Query tùy chọn: `q`, `diningType`, `page`, `limit`. Không khẳng định một món có quán gần đây nếu chưa đối chiếu `restaurant_foods` và dữ liệu hiện hành.

### `GET /discovery/options`

Trả danh sách `companionTypes`, `diningTypes`, `maxRadiusKm: 10`, nhãn tiếng Việt; frontend có thể cache.

## 3. Wheel

### `POST /wheel/spin`

Body:

```json
{
  "mode": "restaurant",
  "filters": {
    "lat": 21.0285,
    "lng": 105.8542,
    "radiusKm": 10,
    "companion": "friends",
    "diningType": "meal"
  },
  "excludeIds": []
}
```

- `mode`: `restaurant` hoặc `food`.
- Server tạo tập ứng viên từ discovery hiện hành; **không tin danh sách ID do client tự gửi là hợp lệ**.
- Với `food`, chỉ chọn món có ít nhất một quán hợp lệ trong bán kính.
- Có thể chọn đều hoặc có trọng số, nhưng phải công bố quy tắc. `excludeIds` chỉ là gợi ý tránh lặp, giới hạn số phần tử.
- Tập rỗng: HTTP `200` với `data: null`, `meta.reason: "NO_CANDIDATES"` (quy ước MVP) và gợi ý thay đổi bộ lọc.

Response:

```json
{
  "data": {
    "mode": "restaurant",
    "selected": { "id": "internal:example-id", "name": "Quán minh họa" }
  },
  "meta": { "candidateCount": 12, "selectionMethod": "uniform" }
}
```

Animation chạy frontend; server quyết định kết quả, frontend quay đến đúng ô đã chọn. Với tập dữ liệu provider thay đổi, không giả định kết quả luôn giống nhau giữa các lần gọi.

## 4. Admin API (bắt buộc xác thực và quyền admin)

| Method | Endpoint | Ý nghĩa |
|---|---|---|
| `POST` | `/auth/login` | Đăng nhập quản trị |
| `POST` | `/auth/logout` | Đăng xuất |
| `GET` | `/auth/me` | Thông tin phiên |
| `GET` | `/admin/restaurants` | Danh sách quán nội bộ |
| `POST` | `/admin/restaurants` | Thêm quán |
| `PATCH` | `/admin/restaurants/:id` | Sửa quán |
| `DELETE` | `/admin/restaurants/:id` | Soft delete / ẩn quán |
| `POST` | `/admin/foods` | Thêm món |
| `PATCH` | `/admin/foods/:id` | Sửa món |

Payload thêm quán tối thiểu:

```json
{
  "name": "Quán minh họa",
  "address": "Địa chỉ minh họa",
  "latitude": 21.0285,
  "longitude": 105.8542,
  "diningTypes": ["snack", "meal"],
  "companionTypes": ["couple", "friends"],
  "status": "draft"
}
```

- Dùng session cookie `HttpOnly`, `Secure`, `SameSite` phù hợp và CSRF protection cho mutation nếu xác thực bằng cookie; không lưu token nhạy cảm trong localStorage.
- Rate limit login, ghi audit log thay đổi, kiểm tra quyền ở **backend**.
- Nếu frontend và API ở hai domain khác nhau, cấu hình CORS origin cụ thể và cookie cross-site cẩn thận; có thể dùng proxy cùng origin để đơn giản hóa.

## 5. Tích hợp và vận hành

- `GET /health` kiểm tra service, không để lộ secrets; DB readiness có thể dùng endpoint riêng bảo vệ.
- Places API lỗi phải có timeout, retry có giới hạn và xử lý quota.
- Không expose dữ liệu cá nhân hoặc tọa độ người dùng trong logs ở độ chính xác không cần thiết.
- Không cache dữ liệu Places vượt điều khoản; rate limit endpoint để tránh lạm dụng chi phí.
- API contract phải được kiểm thử bằng integration tests và fixtures giả lập provider.


## 6. API ảnh – Cloudinary (admin only)

### `POST /admin/uploads/signature`

- Chỉ admin đã xác thực được gọi; có rate limit và giới hạn tên folder/transformation được phép.
- Request: `{ "folder": "hom-nay-an-gi/restaurants", "resourceType": "image" }`. Không nhận tùy ý `publicId`/`overwrite` chưa validate.
- Response (minh họa): `{ "data": { "cloudName": "...", "apiKey": "...", "timestamp": 1234567890, "signature": "...", "folder": "hom-nay-an-gi/restaurants" } }`. `apiSecret` **không bao giờ** gửi về frontend.
- Frontend dùng chữ ký ngắn hạn để upload trực tiếp đến Cloudinary; sau thành công gửi metadata về API.

### `POST /admin/restaurants/:id/images`

- Request: `{ "publicId": "hom-nay-an-gi/restaurants/xyz", "secureUrl": "https://res.cloudinary.com/...", "width": 1200, "height": 900, "altText": "..." }`.
- Backend **không tin** URL/metadata do client tự khai: kiểm tra `publicId` đúng namespace và đối chiếu asset với Cloudinary theo cơ chế đã chọn trước khi ghi Neon.
- Xử lý idempotency; không cho chiếm tài nguyên do admin khác upload.

### `DELETE /admin/restaurants/:id/images/:imageId`

- Kiểm tra quyền, xóa/đánh dấu tại DB và yêu cầu Cloudinary hủy asset bằng `public_id`; xử lý trường hợp xóa một nơi thành công, nơi kia lỗi bằng retry quản trị.
- Không chấp nhận arbitrary external URL để xóa tài nguyên.

## 7. Quy ước vòng quay Hybrid

- `POST /wheel/spin` nhận bộ lọc và tối đa một danh sách **ID ứng viên đã hiển thị**. Backend không tin ID/giá/khoảng cách do trình duyệt cung cấp; tái xác minh tập đủ điều kiện trước khi chọn.
- Nếu dữ liệu provider thay đổi hoặc kết quả tìm kiếm mới khác danh sách cũ, trả `409 CANDIDATES_CHANGED` hoặc làm mới danh sách; không trả thắng cuộc ngoài tập hiển thị.
- Provider có thể trả tối đa số lượng giới hạn (Nearby Search New tối đa 20 kết quả/yêu cầu); `hasMore=false` của danh sách liên kết không có nghĩa tất cả quán trong vòng 10 km đã được khám phá.
- Không gửi full GPS trong analytics; nếu cần ghi nhận sự kiện chọn món chỉ lưu metadata tối thiểu.

**Tham khảo:** https://cloudinary.com/documentation/authentication_signatures · https://developers.google.com/maps/documentation/places/web-service/nearby-search
