# SKILL UI/UX — Hôm Nay Ăn Gì?

> Quy chuẩn dành cho designer, frontend developer và AI coding assistant. Phong cách: **Foodie Adventure** — playful, modern, minimal, mobile-first.

## 1. Nguyên tắc sản phẩm

1. **Quyết định nhanh**: đi cùng ai → kiểu ăn → vị trí → kết quả → vòng quay.
2. **Không chặn khám phá bằng đăng nhập**.
3. **Không ép GPS**: luôn có lựa chọn nhập địa điểm/chọn điểm bản đồ.
4. **Trung thực với dữ liệu**: thiếu rating/giá/giờ mở cửa thì không hiển thị thông tin giả.
5. **Một bộ lọc, hai chế độ xem**: danh sách và bản đồ phản ánh cùng tập kết quả.
6. **Vòng quay có ý nghĩa**: chỉ quay món/quán thỏa điều kiện, giải thích vì sao được chọn.
7. **Có khả năng phục hồi**: lỗi API, mạng chậm, từ chối quyền, không có kết quả đều có trạng thái rõ ràng.

## 2. Design tokens

```css
:root {
  --color-primary: #FF6B4A;
  --color-primary-hover: #E85A3A;
  --color-accent: #FFB84D;
  --color-background: #FFF9F2;
  --color-surface: #FFFFFF;
  --color-text: #252525;
  --color-muted: #6B6B6B;
  --color-border: #EAE5DF;
  --color-success: #27865A;
  --color-error: #C73535;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --shadow-card: 0 6px 24px rgba(37,37,37,.07);
}
```

- Font: **Be Vietnam Pro**; fallback `system-ui, sans-serif`.
- Spacing: hệ 4/8 px; khoảng cách thường dùng 8, 12, 16, 24, 32, 48.
- Nút bấm cao ít nhất 44px; vùng chạm tối thiểu khoảng 44×44px.
- Card ảnh món/quán: 4:3, bo góc 16px, `object-fit: cover`.
- Nội dung trang desktop `max-width` khoảng 1200px; mobile padding 16px.
- Typography tham khảo: H1 32–48px, H2 24–32px, body 16px, caption 12–14px; kiểm tra thực tế trên mobile.
- Không dựa vào màu sắc làm dấu hiệu duy nhất của trạng thái chọn.

## 3. Responsive

| Màn hình | Bố cục |
|---|---|
| `< 640px` | 1 cột, thanh hành động dễ chạm, filter bottom sheet |
| `640–1023px` | 2 cột card, tab danh sách/bản đồ |
| `>= 1024px` | 3 cột card hoặc split view danh sách + bản đồ |

Điểm gãy là định hướng; quyết định dựa trên nội dung thực tế. Không để thanh điều hướng, bản đồ hoặc vòng quay tràn ngang.

## 4. UX flow và thành phần

### Trang chủ `/`
- Header: logo, khám phá, vòng quay; CTA rõ ràng.
- Hero: “Hôm nay ăn gì?” + lời hứa sản phẩm.
- `CompanionPicker`: 3 thẻ Người yêu / Nhóm bạn / Một mình; lựa chọn mặc định có thể thay đổi.
- `DiningTypePicker`: 3 thẻ Ăn vặt / Ăn bình thường / Đi nhậu.
- `LocationPicker`: GPS có nút xin quyền rõ ràng; nhập địa chỉ/chọn trên bản đồ.
- `RadiusSelector`: mặc định 10 km, giới hạn 1–10 km; thể hiện đây là bán kính địa lý.
- CTA: “Tìm quán gần đây” và “Để vòng quay chọn”.

### Khám phá `/explore`
- Hiển thị khu vực và bán kính đã chọn, có nút đổi.
- Toggle Danh sách / Bản đồ (desktop có thể split view).
- Card: ảnh, tên, loại hình, khoảng cách, địa chỉ ngắn, nguồn, giá/rating khi có dữ liệu hợp lệ.
- Bộ lọc: kiểu ăn, khoảng cách, khoảng giá nếu có, sắp xếp; người đi cùng ảnh hưởng mức độ ưu tiên.
- Dữ liệu ngoài có ghi nguồn/attribution theo nhà cung cấp.
- Không gắn nhãn “đang mở” nếu không có dữ liệu cập nhật phù hợp.

### Vòng quay `/wheel`
- Tab `Quay món` và `Quay quán`.
- Tập ứng viên lấy từ kết quả discovery đã lọc; nếu quay món thì chỉ đưa món có ít nhất một quán phù hợp.
- Nút Quay, Quay lại, Xem quán, Chỉ đường; trạng thái loading/empty rõ ràng.
- Animation không cản thao tác; tôn trọng `prefers-reduced-motion`.
- Chọn ngẫu nhiên công bằng trong tập ứng viên hoặc hiển thị rõ nếu có trọng số.

### Admin
- Form rõ ràng, validation theo trường, cảnh báo trước khi ẩn/xóa.
- Chọn tọa độ trên bản đồ và xem trước bán kính.
- Upload ảnh qua dịch vụ object storage phù hợp; không lưu file trực tiếp vào Functions.

## 5. State checklist

| Trạng thái | Thiết kế bắt buộc |
|---|---|
| Loading | Skeleton card, nút không bị bấm lặp |
| Empty | “Chưa tìm thấy quán trong 10 km” + đổi vị trí/kiểu ăn |
| GPS denied | Hướng dẫn nhập địa chỉ hoặc chọn điểm bản đồ |
| API ngoài lỗi | Hiển thị dữ liệu nội bộ, nhãn “Kết quả có thể chưa đầy đủ” |
| Network error | Thông báo dễ hiểu + thử lại |
| Missing image | Placeholder trung tính, không dùng ảnh quán khác |
| Missing price/rating | Ẩn hoặc ghi “Chưa có thông tin” |
| Wheel empty | Không quay; CTA điều chỉnh bộ lọc |

## 6. Accessibility & hiệu năng

- Điều hướng bằng bàn phím; focus ring rõ; nhãn input; `aria-live` cho kết quả và lỗi.
- Độ tương phản theo WCAG AA cho văn bản và điều khiển.
- Ảnh có `alt` đúng nội dung, lazy-load ảnh ngoài viewport, ưu tiên WebP/AVIF hợp lệ.
- Tránh autoplay âm thanh; animation có chế độ giảm chuyển động.
- Debounce ô tìm kiếm, cache dữ liệu phù hợp, phân trang/lazy-load danh sách.
- Map có phương án danh sách thay thế; không yêu cầu thao tác kéo bản đồ để dùng được website.

## 7. Quy tắc component và code

- React functional components, hooks; JavaScript `.jsx`/`.js`, **không TypeScript**.
- Tách `components/ui` dùng chung và `features/*` theo nghiệp vụ.
- UI không gọi Places API bằng secret key; tất cả qua backend.
- Không đặt dữ liệu quán giả vào production hoặc tự tạo rating/giờ mở cửa.
- Component đơn nhiệm; tên PascalCase, hooks bắt đầu `use`, biến camelCase.
- Dùng tokens, không hard-code màu sắc lặp lại; hạn chế thư viện UI trùng chức năng.
- Test keyboard, responsive và các trạng thái lỗi trước khi merge.

## 8. Definition of Done cho màn hình

- [ ] Đúng luồng, có loading/empty/error.
- [ ] Mobile 360px không tràn ngang.
- [ ] Tương tác bàn phím và focus hoạt động.
- [ ] Không hiển thị dữ liệu giả như dữ liệu thật.
- [ ] Nguồn dữ liệu được ghi đúng yêu cầu.
- [ ] Không lộ API key/connection string trong bundle.
- [ ] Đã kiểm tra chức năng khi người dùng từ chối GPS.


## 9. Quy chuẩn ảnh (Cloudinary)

- Ảnh admin upload đi qua Cloudinary; ảnh thẻ quán dùng tỷ lệ **4:3**, `object-fit: cover`; ảnh banner có tỷ lệ thiết kế riêng.
- Với card: cung cấp `srcSet`/sizes hoặc Cloudinary transformations phù hợp, ảnh tải dần và placeholder khi thiếu.
- Có label/alt ảnh cho thông tin có ý nghĩa; ảnh trang trí được đánh dấu thích hợp.
- Không tự lấy ảnh từ Google Places rồi ghi vào Cloudinary; ảnh từ provider phải dùng đúng cách và có attribution theo nguồn.
- Nút **Tải ảnh** trong admin có preview, giới hạn định dạng và dung lượng được xác thực cả client và backend; hiển thị progress, lỗi, nút thử lại.

## 10. Bản đồ khi dùng Hybrid

- Chọn đúng renderer theo bản quyền: bản đồ có điểm **Google Places** dùng **Google Map**. Leaflet chỉ dùng cho dữ liệu nội bộ/nguồn tương thích, không dùng Leaflet để vẽ các điểm Google Places.
- Danh sách quán từ Google cần attribution/logo Google Maps đúng hướng dẫn kể cả khi không hiển thị bản đồ.
- Điểm quán cần đủ tương phản, có thể dùng qua bàn phím, chuyển điểm ↔ card, không phụ thuộc màu duy nhất để phân biệt nguồn.
- Trên mobile: mặc định danh sách, tab chuyển sang bản đồ; luôn có nút quay về danh sách và hướng dẫn nếu permission bị từ chối.

## 11. Accessibility chi tiết

- Dùng tone coral `#FF6B4A` làm nền trang trí/nhấn; với nút CTA cần **kiểm tra tương phản văn bản** trước khi dùng màu chữ trắng; có thể chọn chữ rất tối hoặc biến thể primary đậm.
- Bước wizard có tiêu đề, tiến trình bằng chữ (*Bước 2/3*), không chỉ dựa màu sắc.
- Vòng quay thông báo kết quả qua `aria-live=polite`; có chế độ không animation với `prefers-reduced-motion`.
- Trạng thái `Đang tải`, `Không có quán`, `Tạm không gọi được Google Places` phải có nội dung và hành động tiếp theo.
