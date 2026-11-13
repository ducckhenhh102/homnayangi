# Hôm Nay Ăn Gì? — Project Overview

> Phiên bản tài liệu: 2.0 · cập nhật 14/11/2026 | Ngôn ngữ phát triển: JavaScript (không dùng TypeScript) | Trạng thái: thiết kế MVP

## 1. Tầm nhìn

Website giúp người dùng quyết định **ăn gì, ăn ở đâu** dựa trên người đi cùng, kiểu ăn và vị trí, sau đó có thể dùng vòng quay chọn món/quán. Sản phẩm mobile-first, không bắt đăng nhập để khám phá.

## 2. Luồng chính

1. Chọn **người đi cùng**: `couple` (người yêu), `friends` (nhóm bạn), `solo` (một mình).
2. Chọn **kiểu ăn**: `snack` (ăn vặt), `meal` (ăn uống bình thường), `drinking` (đi nhậu).
3. Chọn **vị trí** bằng GPS có sự đồng ý hoặc nhập/chọn trên bản đồ.
4. Tìm quán trong bán kính **mặc định và tối đa 10 km** (đường chim bay).
5. Xem danh sách/bản đồ, lọc, xem chi tiết, chỉ đường hoặc dùng vòng quay chọn **món** / **quán**.

Người đi cùng là tín hiệu xếp hạng, **không phải bộ lọc loại trừ cứng**; kiểu ăn là bộ lọc rõ ràng. Một quán có thể thuộc nhiều kiểu ăn.

## 3. MVP và ngoài phạm vi

### MVP
- Discovery wizard, lưu lựa chọn gần nhất trên thiết bị.
- GPS với quyền người dùng, chọn vị trí thủ công, giới hạn 10 km.
- Dữ liệu Hybrid: quán do admin quản lý + nhà cung cấp Places bên ngoài.
- Danh sách, bản đồ, chi tiết quán, nguồn dữ liệu và thông báo trạng thái thiếu dữ liệu.
- Vòng quay món/quán dùng đúng tập kết quả đã lọc; xử lý tập rỗng.
- Admin đăng nhập, quản lý quán, món, phân loại và ảnh được phép sử dụng.
- Giao diện responsive, trạng thái loading/error/empty, accessibility cơ bản.

### Sau MVP
- Tài khoản khách, yêu thích, đánh giá, lịch sử, cá nhân hóa, AI, nhóm cùng bỏ phiếu, thông báo.
- Đồng bộ nhiều nhà cung cấp, định tuyến khoảng cách lái xe, tìm kiếm nâng cao.

## 4. Stack và hosting

| Lớp | Công nghệ |
|---|---|
| Frontend | React, Vite, JavaScript, Tailwind CSS, React Router |
| UI state | Zustand (khi cần); TanStack Query cho dữ liệu server |
| Bản đồ | Leaflet/React Leaflet cho **dữ liệu được phép hiển thị** |
| Backend | Node.js, Express, Zod |
| Serverless | Vercel Functions, native Express app entrypoint `backend/src/app.js` |
| Database | Neon PostgreSQL, Prisma ORM (pooled runtime/direct migrations) |
| Ảnh món/quán | Cloudinary (signed admin upload, CDN), metadata lưu Neon |
| Địa điểm ngoài | Google Places API (New), feature flag + quota + attribution |
| Mã nguồn | Monorepo GitHub: `frontend/`, `backend/`, `docs/` |
| Deploy | Hai Vercel Projects trỏ về hai thư mục tương ứng |

Lưu ý: Vercel Hobby có giới hạn và điều kiện sử dụng; Google Places thường yêu cầu billing. Không cam kết toàn hệ thống miễn phí. Không lưu file upload lâu dài trong filesystem Vercel Functions.

## 5. Kiến trúc

```text
Browser (React / Vercel)
    | HTTPS
    v
Express API (Vercel Functions)
    |-- Auth / Validation / Discovery / Wheel
    |-- Neon PostgreSQL: quán/món/phân loại/định danh provider đã liên kết
    |-- Cloudinary: ảnh do admin có quyền sử dụng (Upload API/CDN)
    `-- PlacesProvider adapter: Google Places API (New), sau khi được bật
             |
             `-- normalize -> deduplicate -> filter -> rank -> response
```

Backend giữ bí mật `DATABASE_URL`, API key và xác thực admin. Frontend chỉ nhận dữ liệu đã chuẩn hóa, không truy cập Neon trực tiếp.

## 6. Nguyên tắc dữ liệu

- `restaurants` là thực thể trung tâm; món ăn có thể bán ở nhiều quán qua `restaurant_foods`.
- Dữ liệu nội bộ thuộc quyền quản lý của admin; dữ liệu ngoài phải theo điều khoản nhà cung cấp, không sao chép toàn bộ vào Neon.
- Quán trùng được nối qua provider ID đã xác minh hoặc so khớp tên/địa chỉ/tọa độ có kiểm soát.
- Giá, rating, giờ mở cửa là **nullable**; không tự suy đoán. Trạng thái mở cửa cần ghi thời điểm kiểm tra.
- Vòng quay chỉ chọn ứng viên hợp lệ trong phạm vi và kiểu ăn; không dùng `Math.random()` như bảo đảm bảo mật.
- 10 km là bán kính địa lý, **không phải** khoảng cách đi đường.

## 7. Trang và đường dẫn

| URL | Chức năng |
|---|---|
| `/` | Trang chủ + wizard |
| `/explore` | Danh sách/bản đồ và bộ lọc |
| `/restaurants/:id` | Chi tiết quán |
| `/wheel` | Vòng quay món hoặc quán |
| `/admin/login` | Đăng nhập quản trị |
| `/admin/restaurants` | Quản lý quán |
| `/admin/restaurants/new` | Thêm quán |

## 8. Tiêu chí nghiệm thu MVP

1. Tìm đúng quán nội bộ trong bán kính 10 km và loại quán ngoài phạm vi.
2. Nếu API ngoài lỗi, quán nội bộ vẫn hiển thị cùng thông báo kết quả chưa đầy đủ.
3. Không có quán trùng sau khi liên kết provider ID đã xác minh.
4. Vòng quay không trả quán ngoài tập đã lọc; tập rỗng có hướng xử lý.
5. Người dùng từ chối GPS vẫn tìm bằng địa điểm thủ công.
6. Admin CRUD được bảo vệ bằng xác thực và phân quyền; không lộ khóa API.
7. Website chạy được trên mobile và deploy được frontend/backend qua Vercel.

## 9. Tài liệu liên quan

- [SKILL_UI_UX.md](./SKILL_UI_UX.md)
- [DATABASE.md](./DATABASE.md)
- [API.md](./API.md)
- [HYBRID_PLACES.md](./HYBRID_PLACES.md)
- [ROADMAP.md](./ROADMAP.md)
- [ROADMAP_DETAILED.md](./ROADMAP_DETAILED.md) — lộ trình chia thành các bước nhỏ, lệnh, điều kiện hoàn thành, commit
- [CLOUDINARY_STORAGE.md](./CLOUDINARY_STORAGE.md) — upload ảnh an toàn
- [DEPLOYMENT_VERCEL.md](./DEPLOYMENT_VERCEL.md) — triển khai hai project và cấu hình môi trường


## 10. Quyết định kiến trúc đã chốt (ADR-001)

- **Monorepo** `frontend/` (React + Vite + JavaScript) và `backend/` (Express + JavaScript). Không sử dụng TypeScript trong application code; Prisma config dùng file `.js` hoặc `.mjs` nếu phiên bản hỗ trợ.
- **Vercel**: frontend và backend là **hai Projects độc lập** cùng trỏ tới một GitHub repo. Vercel Hobby là gói dành cho dự án cá nhân phi thương mại, không mặc định phù hợp hoạt động thương mại.
- **Neon** là nguồn dữ liệu chuẩn cho **quán do admin tự quản lý**, menu, danh mục, người quản trị, metadata ảnh và các liên kết `provider_place_id` được phép lưu.
- **Cloudinary** lưu ảnh do admin upload và có quyền sử dụng; database chỉ lưu `public_id`, `secure_url`, kích thước và mô tả cần thiết.
- **Google Places API (New)** là *provider bên ngoài có thể tắt* (`PLACES_ENABLED=false` là trạng thái phát triển mặc định). Có thể cần billing và có phát sinh phí. Không sao chép dữ liệu/ảnh provider vào Neon hoặc Cloudinary khi không có quyền.
- **Bản đồ**: khi hiển thị dữ liệu từ Google Places trên bản đồ, dùng **Google Map** theo yêu cầu của Google. Leaflet chỉ cho bản đồ dùng dữ liệu nội bộ/nguồn được cấp quyền phù hợp; không trộn điểm Google Places trên Leaflet.
- **Vòng quay** chọn trong tập ứng viên phù hợp đã tìm và được xác minh; kết quả mang theo nguồn nội bộ / Google.
- **Ảnh, giá, rating, giờ mở cửa** có thể là `null`; UI không giả định dữ liệu thiếu là chính xác.

## 11. Ranh giới miễn phí

Có thể khởi đầu với Vercel Hobby + Neon Free + Cloudinary Free trong hạn mức, nhưng không có cam kết hệ thống luôn miễn phí. Google Maps Platform Places yêu cầu quản lý billing/quota, mức tiêu thụ và điều khoản; theo dõi console của từng nhà cung cấp trước khi bật production.

**Tài liệu nguồn chính thức:**
- https://vercel.com/docs/monorepos
- https://vercel.com/docs/frameworks/backend/express
- https://vercel.com/docs/plans/hobby
- https://neon.com/docs/connect/connection-pooling
- https://cloudinary.com/documentation/node_image_and_video_upload
- https://developers.google.com/maps/documentation/places/web-service/policies
