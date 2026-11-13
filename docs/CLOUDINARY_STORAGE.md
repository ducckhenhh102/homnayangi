# CLOUDINARY STORAGE — Ảnh quán ăn và món ăn

> Phiên bản 1.0 · 14/11/2026 · Áp dụng cho React/Vite (frontend), Express/Vercel Functions (backend), Neon PostgreSQL (metadata). Không dùng Supabase Storage ở kiến trúc hiện tại.

## 1. Vai trò và quyết định

- **Cloudinary**: lưu bytes ảnh, phân phối qua CDN và tối ưu định dạng/kích thước.
- **Neon**: lưu metadata (`public_id`, `secure_url`, `width`, `height`, `alt_text`, `sort_order`, quyền ảnh, liên kết `restaurant_id`/`food_id`).
- **Vercel**: chạy code; không dùng filesystem Functions làm nơi lưu ảnh lâu dài.
- **Google Places**: dữ liệu và ảnh của nhà cung cấp ngoài, **không upload lại ảnh Google Places vào Cloudinary nếu không có giấy phép**.
- Có thể bắt đầu với Cloudinary Free; **giới hạn 25 monthly credits** được chia sẻ giữa lưu trữ, xử lý và truyền tải theo chính sách hiện hành. Theo dõi usage tại dashboard. Không cam kết luôn miễn phí.

## 2. Luồng upload đề xuất: admin ký, browser upload thẳng Cloudinary

```text
Admin React -> POST /api/v1/admin/uploads/signature (cookie/session có quyền admin)
  Express -> xác thực role, giới hạn folder, mime, size, rate limit
  Express -> tạo signature bằng CLOUDINARY_API_SECRET
  Express -> trả signature, timestamp, cloudName, apiKey, folder (KHÔNG secret)
Admin React -> POST trực tiếp Cloudinary Upload API với file + signature
Cloudinary -> public_id, secure_url, width, height, format, bytes
Admin React -> POST /api/v1/admin/restaurants/:id/images
  Express -> xác minh resource hợp lệ, giới hạn namespace/quyền sở hữu
  Express -> ghi metadata vào Neon
```

**Vì sao ký trước?** Browser upload thẳng lên Cloudinary giúp tránh đẩy file ảnh lớn qua một Vercel Function, nhưng quyền upload vẫn được cấp bởi Express. Upload unsigned bằng preset công khai đơn giản hơn nhưng tăng bề mặt lạm dụng; chỉ cân nhắc khi hiểu rõ bảo vệ preset.

## 3. Cấu trúc thư mục asset

| Folder Cloudinary | Mục đích |
|---|---|
| `hom-nay-an-gi/restaurants/` | Ảnh quán được admin duyệt |
| `hom-nay-an-gi/foods/` | Ảnh món do admin quản lý |
| `hom-nay-an-gi/banners/` | Banner và hình trang trí được phép sử dụng |

Không dùng tên file người dùng làm duy nhất `public_id`. Để Cloudinary sinh ID an toàn hoặc sinh ID ngẫu nhiên phía server; tránh ghi đè ảnh mặc định. Quán có thể có nhiều ảnh, ảnh cover chọn theo `sort_order`.

## 4. Cấu hình môi trường

**Backend `.env` (KHÔNG commit):**

```dotenv
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER_ROOT=hom-nay-an-gi
MAX_IMAGE_SIZE_MB=5
```

`CLOUDINARY_API_SECRET` chỉ tồn tại trong backend (Vercel Project backend). Không đặt nó trong biến `VITE_*` hoặc bất kỳ file JavaScript/HTML gửi xuống trình duyệt.

**Frontend** có thể dùng `VITE_API_BASE_URL` để gọi Express. `cloudName` và `apiKey` dùng cho signed upload có thể được backend cung cấp, nhưng secret và quy tắc ký phải ở server.

## 5. Kiểm tra trước khi chấp nhận ảnh

- [ ] Admin đã đăng nhập; middleware kiểm tra `role=admin`.
- [ ] Cho phép định dạng hợp lý: JPEG/PNG/WebP/AVIF tùy hỗ trợ; xác minh MIME thực, không chỉ extension.
- [ ] Kích thước tối đa do dự án quyết định (MVP đề xuất 5 MB/ảnh); giới hạn kích thước/số ảnh tại UI và server.
- [ ] Chỉ cho phép `resource_type=image`; kiểm soát `folder`, transformations, tối đa số request upload.
- [ ] Từ chối `public_id` không thuộc namespace cho phép hoặc đã thuộc về bản ghi khác.
- [ ] Không cho phép tùy ý yêu cầu backend tải ảnh từ URL bất kỳ (tránh SSRF).
- [ ] Tránh file lỗi, mime giả, thừa dung lượng, dữ liệu EXIF có thông tin riêng tư khi không cần.
- [ ] Giới hạn số ảnh/quán (ví dụ 8 ảnh lúc đầu, không hard-code như giới hạn provider).
- [ ] Lưu `rights_source`, người upload, thời gian upload; xóa/ẩn nếu bị báo cáo vi phạm quyền ảnh.

## 6. Mô hình dữ liệu

Bảng `restaurant_images`:

```text
id                   uuid PRIMARY KEY
restaurant_id        uuid REFERENCES restaurants(id)
cloudinary_public_id text UNIQUE NOT NULL
secure_url           text NOT NULL
width                integer
height               integer
alt_text             text
rights_source        text
sort_order           integer DEFAULT 0
uploaded_by          uuid REFERENCES users(id)
created_at           timestamptz DEFAULT now()
```

Cấu trúc tương tự cho `food_images` với `food_id`. `secure_url` có thể thay đổi khi triển khai đổi tài khoản/đổi transformation: `public_id` mới là khóa để xóa hoặc thao tác tài nguyên; tuyệt đối không tự suy ra ownership chỉ từ URL client gửi.

## 7. Hiển thị và tối ưu

- Ảnh danh sách quán: khung 4:3, `object-fit: cover`, lazy load khi ngoài viewport.
- Banner ảnh hero: kích thước riêng, không dùng ảnh thumbnail kéo giãn.
- Có thể dùng Cloudinary URL transformations `f_auto,q_auto` hoặc SDK phù hợp, song chỉ với ảnh thuộc quyền quản lý/được phép.
- Kích thước truyền tải cần đúng `sizes`/`srcSet` để không tải ảnh quá lớn trên mobile.
- Khi thiếu ảnh: dùng placeholder chuẩn; không lấy ảnh quán khác để giả thông tin.
- Cache CDN và đường dẫn ảnh cần tuân thủ quy tắc invalidation khi thay ảnh/đổi asset.

## 8. Cập nhật/xóa ảnh không làm mất đồng bộ

1. Admin chọn xóa ảnh đã đăng.
2. API kiểm tra quyền sở hữu ảnh và trạng thái bản ghi trong Neon.
3. Gọi Cloudinary destroy bằng `public_id` phía server.
4. Đánh dấu ảnh đã xóa/ẩn trong Neon; hoặc dùng job retry nếu Cloudinary trả lỗi.
5. Ghi audit log kết quả; không để bản ghi đang dùng trỏ vào ảnh mất.

Nếu upload Cloudinary thành công nhưng ghi Neon thất bại, cần xử lý asset mồ côi bằng cơ chế dọn rác có kiểm soát (không xóa tất cả asset trong folder).

## 9. API Contract

Chi tiết xem [API.md](./API.md):

- `POST /api/v1/admin/uploads/signature`
- `POST /api/v1/admin/restaurants/:id/images`
- `DELETE /api/v1/admin/restaurants/:id/images/:imageId`

## 10. Kiểm thử và hoàn thành

- [ ] User thường không thể xin chữ ký upload.
- [ ] Không có `CLOUDINARY_API_SECRET` trong frontend bundle/Git/logs.
- [ ] Upload ảnh JPEG và WebP thành công, ảnh hiển thị qua CDN.
- [ ] File sai loại hoặc quá kích thước bị từ chối.
- [ ] Khi Cloudinary lỗi, form admin cho thử lại và không tạo bản ghi sai.
- [ ] Xóa ảnh không thể xóa ảnh không thuộc quán.
- [ ] Tính được mức credits tiêu thụ trên dashboard.

## Tài liệu chính thức

- https://cloudinary.com/pricing
- https://cloudinary.com/documentation/node_image_and_video_upload
- https://cloudinary.com/documentation/authentication_signatures
- https://cloudinary.com/documentation/client_side_uploading
- https://cloudinary.com/documentation/image_upload_api_reference
