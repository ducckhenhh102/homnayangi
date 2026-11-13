# ROADMAP — Lộ trình tổng quan “Hôm Nay Ăn Gì?”

> Phiên bản 2.0 · cập nhật 14/11/2026 · Stack: React + Vite + **JavaScript** / Express + **JavaScript** / Neon PostgreSQL + Prisma / Cloudinary / Vercel / Google Places Hybrid.

**Đây là bản tóm tắt.** Khi bắt đầu code, dùng **[ROADMAP_DETAILED.md](./ROADMAP_DETAILED.md)** làm nguồn hướng dẫn chính. File chi tiết có **hơn 100 checklist công việc**, lệnh, cách kiểm tra, commit và tiêu chí nghiệm thu.

## Trình tự thực hiện chính thức

| Giai đoạn | Mục tiêu | Kết quả bắt buộc | Commit tiêu biểu |
|---|---|---|---|
| 0. Chuẩn bị | Node, npm, Git, VS Code và tài khoản dịch vụ | Môi trường sẵn sàng | Chưa cần |
| 1. Git/Docs | Monorepo `frontend/` + `backend/`, tài liệu | GitHub repo sạch, không secret | `chore: initialize repository and project docs` |
| 2. React/Vite | Khởi tạo frontend JavaScript, Tailwind, Router | React chạy local | `chore(frontend): scaffold React Vite JavaScript app` |
| 3. UI Foundation | Design tokens, header, buttons, home | Responsive, accessible | `feat(ui): establish design system` |
| 4. Wizard | 3 người đi cùng, 3 nhóm ăn, chọn vị trí | Lưu lựa chọn và mở Explore | `feat(discovery): implement three-step wizard` |
| 5. Express | App Express, health, error handler, Zod | API local chạy, validate input | `feat(api): add health endpoint` |
| 6. Neon/Prisma | Schema, migrations, seed, foreign keys | DB hợp lệ, dữ liệu nội bộ | `feat(db): add restaurant schema and seed` |
| 7. Quán nội bộ | List/detail/filter API, React cards | Xem quán từ Neon | `feat(restaurants): add list and detail endpoints` |
| 8. Admin CRUD | Đăng nhập admin, quyền, thêm/sửa/ẩn quán/món | Không cần deploy lại khi thêm quán | `feat(admin): add protected restaurant CRUD` |
| 9. Cloudinary | Upload ảnh có chữ ký, hiển thị, xóa ảnh | Ảnh lưu Cloudinary, metadata ở Neon | `feat(media): add signed Cloudinary uploads` |
| 10. Nearby 10 km | GPS, chọn vị trí, Haversine/PostGIS nếu cần | Quán trong bán kính 10 km nội bộ | `feat(location): implement 10km nearby search` |
| 11. Food Wheel | Quay món/quán đã lọc | Không quay ứng viên ngoài phạm vi | `feat(wheel): add filtered food wheel` |
| 12. Hybrid Places | Google Places adapter, dedup, fallback | Internal + external theo chính sách | `feat(places): add Google Places adapter` |
| 13. Map Hybrid | Map/list, Google Map attribution | Không vẽ Google Places trên Leaflet | `feat(map): display hybrid results with attribution` |
| 14. Kiểm thử | Unit, integration, E2E, bảo mật, a11y | Không còn lỗi nghiêm trọng đã biết | `test(api): cover discovery and hybrid flows` |
| 15. Deploy | Hai Vercel Projects, Neon, Cloudinary | Trang web công khai, API/ảnh hoạt động | `chore(deploy): configure Vercel projects` |
| 16. Sau MVP | Favorites, share, AI, tối ưu | Chỉ làm khi MVP đã ổn định | Theo tính năng |

## Điểm kiểm tra bắt buộc (gates)

**Gate A — UI dùng được:** Người dùng chọn được 3 bước; từ chối GPS vẫn chọn vị trí khác; mobile không tràn ngang.

**Gate B — Data thật:** API đọc được Neon; dữ liệu demo không xuất hiện như quán thật; admin có thể sửa quán và cập nhật ảnh.

**Gate C — Discovery nội bộ:** Quán ngoài bán kính 10 km không được trả về; vòng quay không chọn quán sai điều kiện; không phụ thuộc Places API.

**Gate D — Hybrid đúng điều khoản:** Chỉ bật Google Places sau khi cấu hình billing/quota/key/attribution. Google content trên map dùng Google Map; không lưu trái phép Google data vào Neon/Cloudinary. API lỗi phải fallback dữ liệu nội bộ.

**Gate E — Production:** Hai project Vercel deploy thành công, database pooled runtime, migration direct qua job, secret được bảo vệ, kiểm tra HTTPS/CORS/upload/truy vấn/vòng quay.

## Quy tắc làm việc với AI

1. Mỗi lần chỉ thực hiện **một bước nhỏ** rồi kiểm tra output thực tế.
2. Luôn nói chính xác **file cần tạo/sửa**, nội dung và lý do.
3. **JavaScript/JSX, không TypeScript** cho ứng dụng frontend/backend.
4. Không xây cả kiến trúc rỗng trong lần đầu; tạo theo phase.
5. Test xong một đơn vị thì mới commit, commit có ý nghĩa.
6. Không tự đổi stack hoặc mở rộng bán kính quá 10 km.
7. Dữ liệu Google Places có quy tắc pháp lý và phát sinh chi phí; để `PLACES_ENABLED=false` trong giai đoạn chưa tích hợp.
8. Nếu lỗi hãy kiểm tra log/output hiện tại trước, không bắt người học lặp các bước đã thành công.

## File cần đọc theo phase

- Phases 0–4: [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md), [SKILL_UI_UX.md](./SKILL_UI_UX.md)
- Phases 5–8: [DATABASE.md](./DATABASE.md), [API.md](./API.md)
- Phase 9: [CLOUDINARY_STORAGE.md](./CLOUDINARY_STORAGE.md)
- Phases 10–13: [HYBRID_PLACES.md](./HYBRID_PLACES.md), [SKILL_UI_UX.md](./SKILL_UI_UX.md)
- Phases 14–15: [DEPLOYMENT_VERCEL.md](./DEPLOYMENT_VERCEL.md), [API.md](./API.md)
- **Tất cả:** [ROADMAP_DETAILED.md](./ROADMAP_DETAILED.md)

## Bắt đầu từ đâu?

**Bước 0.1:** mở PowerShell hoặc Terminal trong VS Code, chạy:

```powershell
node -v
npm -v
git --version
```

Sau khi kiểm tra được cả 3 phiên bản, đánh dấu bước `0.1` trong [ROADMAP_DETAILED.md](./ROADMAP_DETAILED.md), rồi chỉ làm tiếp `0.2`.
