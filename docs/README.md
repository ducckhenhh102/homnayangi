# Bộ tài liệu `docs/` — Dự án Hôm Nay Ăn Gì?

> Phiên bản 2.0 · 14/11/2026 · UTF-8 Markdown · Không chứa mật khẩu hoặc API key thật.

## Mục tiêu

Website đề xuất quán ăn theo **người đi cùng** (người yêu/nhóm bạn/một mình), **nhu cầu** (ăn vặt/ăn bình thường/đi nhậu), **vị trí + bán kính tối đa 10 km**, kèm **vòng quay món/quán**. Dữ liệu quán theo mô hình **Hybrid**: admin tự quản lý trong Neon PostgreSQL + tích hợp API địa điểm khi cho phép.

**Công nghệ chính thức:** React + Vite + JavaScript, Tailwind CSS, Node.js + Express (JavaScript), Prisma, Neon PostgreSQL, Cloudinary để lưu ảnh, Vercel để host hai ứng dụng và Google Places API (New) khi bật Hybrid. Không cần mua VPS.

## Danh mục tài liệu

| File | Dành cho | Nội dung |
|---|---|---|
| [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) | Tất cả | Yêu cầu, mục tiêu, kiến trúc, MVP, nguồn dữ liệu |
| [SKILL_UI_UX.md](./SKILL_UI_UX.md) | Designer/Frontend/AI | Màu sắc, typography, màn hình, luồng, trạng thái, accessibility |
| [DATABASE.md](./DATABASE.md) | Backend/DB | ERD, mô hình bảng, Neon, Prisma, ảnh metadata, truy vấn gần |
| [API.md](./API.md) | FE/BE | Contract REST, validation, error codes, auth admin, vòng quay, upload |
| [HYBRID_PLACES.md](./HYBRID_PLACES.md) | Backend/Map/AI | Google Places adapter, lọc, dedup, dữ liệu bản quyền, attribution, fallback |
| [CLOUDINARY_STORAGE.md](./CLOUDINARY_STORAGE.md) | FE/BE/Admin | Upload ảnh signed, CDN, security, storage metadata, dọn ảnh |
| [DEPLOYMENT_VERCEL.md](./DEPLOYMENT_VERCEL.md) | DevOps/AI | Hai Vercel projects, env, Neon connection, SPA rewrites, production checks |
| [ROADMAP.md](./ROADMAP.md) | Chủ dự án | Kế hoạch tổng quan theo 17 giai đoạn |
| **[ROADMAP_DETAILED.md](./ROADMAP_DETAILED.md)** | **Người thực hành** | **Checklist từng bước, điều kiện hoàn thành, lệnh, commit và test E2E** |

## Thứ tự đọc đề xuất

1. `PROJECT_OVERVIEW.md` để hiểu sản phẩm và phạm vi.
2. `SKILL_UI_UX.md` để hiểu trải nghiệm.
3. `ROADMAP.md` để nhìn toàn cảnh.
4. `ROADMAP_DETAILED.md` rồi triển khai **từng bước nhỏ**.
5. Đọc các tài liệu chuyên môn khi đến phase tương ứng.

## Kiến trúc nhanh

```text
Browser / React+Vite (Vercel Frontend Project)
                |
                v
Express API (Vercel Backend Project)
    |                 |                  |
    v                 v                  v
Neon PostgreSQL    Cloudinary      Places Provider
quán, món,          ảnh do admin    Google Places API
vị trí, metadata    được phép      có thể bật/tắt
```

**Quy tắc dữ liệu:** Google Places không phải nguồn để tự sao chép vĩnh viễn thành database riêng. Trên map có nội dung Google Places phải dùng Google Map và attribution theo chính sách. Ảnh do admin có quyền sử dụng nằm trên Cloudinary.

## Cấu trúc repo sau khi copy

```text
hom-nay-an-gi/
├── frontend/     # tạo khi bắt đầu Phase 2
├── backend/      # tạo khi bắt đầu Phase 5
├── docs/         # toàn bộ các file này
├── .gitignore    # tạo ở Phase 1
└── README.md     # tạo ở Phase 1
```

**Lưu ý:** Gói ZIP chỉ chứa tài liệu, **không phải source code website đã xây dựng**. Khi làm với AI khác, đưa cả thư mục docs và yêu cầu AI bám theo `ROADMAP_DETAILED.md`, chỉ hướng dẫn một bước mỗi lần, dùng JavaScript và commit sau khi hoàn thành.
