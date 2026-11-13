# DEPLOYMENT VERCEL — React + Express + Neon + Cloudinary

> Phiên bản 1.0 · 14/11/2026 · Hướng dẫn triển khai **không cần mua VPS**. Áp dụng cho một Git repository với `frontend/` và `backend/`.

## 1. Phạm vi và giới hạn

- **Frontend:** React/Vite SPA tĩnh trên Vercel.
- **Backend:** Express Node.js dưới dạng Vercel Functions, không phải tiến trình VPS chạy liên tục.
- **Database:** Neon PostgreSQL; runtime dùng connection string **pooled**, migrations dùng **direct**.
- **Images:** Cloudinary; frontend gửi file trực tiếp lên Cloudinary bằng chữ ký do backend cấp.
- **Places:** Google Places API (New) chỉ bật sau khi đã kiểm tra billing, quota, chính sách dữ liệu và attribution.
- **Gói miễn phí:** Vercel Hobby chỉ dành cho **mục đích cá nhân, phi thương mại**. Nếu website thương mại hoặc vượt hạn mức, cần đánh giá kế hoạch trả phí/phương án hosting khác.

## 2. Repository đích (các file tạo dần theo lộ trình)

```text
hom-nay-an-gi/
├── frontend/
│   ├── public/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json
│   └── .env.example
├── backend/
│   ├── src/app.js
│   ├── dev.js
│   ├── src/modules/
│   ├── src/integrations/{cloudinary,places}/
│   ├── prisma/schema.prisma
│   ├── prisma/seed.js
│   ├── prisma.config.js
│   ├── package.json
│   └── .env.example
├── docs/
└── .gitignore
```

## 3. Phát triển local

```powershell
# Terminal A
cd frontend
npm install
npm run dev

# Terminal B, từ thư mục gốc của repo
cd backend
npm install
npm run dev
```

Ví dụ địa chỉ local: frontend `http://localhost:5173`, backend `http://localhost:3000` nếu scripts được cấu hình tương ứng. CORS dev chỉ cấp phép origin thật của frontend.

## 4. Hai Vercel Projects từ cùng GitHub repository

| Vercel Project | Root Directory | Cài đặt/ghi chú |
|---|---|---|
| `hom-nay-an-gi-web` | `frontend` | Vite; build `npm run build`; output `dist` |
| `hom-nay-an-gi-api` | `backend` | Express/Vercel Functions; Vercel tự nhận diện `src/app.js` có default export |

**Cách thực hiện:** push GitHub -> Vercel New Project -> import repository -> đặt Root Directory cho frontend -> Deploy; lặp lại với **cùng repo**, lần này Root Directory `backend`. Vercel monorepo hỗ trợ nhiều project từ một repo; mỗi project có env độc lập.

### Frontend SPA rewrites

Với React Router dạng BrowserRouter, tạo `frontend/vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Điều này cho phép truy cập trực tiếp `/explore`, `/wheel`, `/admin/login` sau khi refresh. Nếu về sau dùng proxy API **cùng origin**, cần đặt rule `/api/...` trước fallback SPA và kiểm tra không xung đột.

### Express app trong Vercel

Theo tài liệu **Express on Vercel** cập nhật năm 2026, Vercel có thể **tự nhận diện `src/app.js`** nếu file import Express và default-export app. Không bắt buộc tạo `api/index.js` và không cần rewrite Function thủ công cho trường hợp này. Một ví dụ tổ chức đơn giản:

```js
// backend/src/app.js
import express from 'express';
const app = express();
app.use(express.json());
app.get('/api/v1/health', (_req, res) => res.json({ data: { status: 'ok' } }));
export default app;

// backend/dev.js (chỉ local; không thuộc tên auto-detect Express của Vercel)
import app from './src/app.js';
const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`API listening on ${port}`));
```

Ví dụ cần được thử trên đúng phiên bản runtime/framework và routing Vercel đang dùng. **Không** gọi `app.listen()` trong `src/app.js` ở Function; chỉ chạy listener ở `dev.js` local. Trước khi deploy tất cả API, hãy triển khai và kiểm thử `/api/v1/health` trên địa chỉ production trước. Nếu Vercel không nhận diện đúng, kiểm tra Build Logs và tài liệu Express chính thức, không tự thêm rewrite mù quáng.

## 5. Biến môi trường

**Frontend Project:**

```dotenv
VITE_API_BASE_URL=https://your-api-project.vercel.app/api/v1
```

Mọi biến `VITE_*` được đưa vào bundle frontend: **không đặt bất kỳ secret nào ở đây**.

**Backend Project:**

```dotenv
NODE_ENV=production
FRONTEND_ORIGIN=https://your-frontend-project.vercel.app
DATABASE_URL=postgresql://user:password@your-neon-pooler-host/neondb?sslmode=require
DIRECT_URL=postgresql://user:password@your-neon-direct-host/neondb?sslmode=require
SESSION_SECRET=replace_with_strong_random_secret
CLOUDINARY_CLOUD_NAME=example
CLOUDINARY_API_KEY=example
CLOUDINARY_API_SECRET=secret_keep_only_server
CLOUDINARY_FOLDER_ROOT=hom-nay-an-gi
PLACES_ENABLED=false
GOOGLE_PLACES_API_KEY=only_if_places_enabled
GOOGLE_MAPS_BROWSER_KEY=if_using_google_map_renderer
```

Các URL và key trên chỉ là **placeholder**, không phải giá trị đăng nhập thật. `GOOGLE_MAPS_BROWSER_KEY` cho Google Maps JavaScript SDK thường thuộc frontend, nhưng cần hạn chế **HTTP referrers** cho đúng domain; không dùng browser key đó làm server key. Nếu dùng Google Maps JavaScript ở frontend, đặt `VITE_GOOGLE_MAPS_BROWSER_KEY` với restrictions và quota phù hợp, **không dùng key server Places**.

`DIRECT_URL` chỉ phục vụ CI/migration/ops; hạn chế scope xuất hiện trong runtime nếu không cần.

## 6. Neon + Prisma + migration

1. Tạo Neon Project; copy **pooled connection** cho `DATABASE_URL` và **direct connection** cho `DIRECT_URL`.
2. Xác định Prisma major version, dùng file config **JavaScript** (`prisma.config.js`/`.mjs` nếu phiên bản hỗ trợ); cân nhắc adapter và generator đúng hướng dẫn Neon/Prisma hiện hành.
3. Thiết kế schema, tạo migration trên local theo quy trình.
4. Chạy `prisma migrate deploy` qua terminal/job quản trị có quyền dùng `DIRECT_URL`.
5. Build backend phải tạo Prisma Client phù hợp; kiểm tra `npm run build`/`prisma generate` tùy scripts, không để bước generate bị bỏ qua.
6. Không chạy `prisma migrate dev`/`prisma migrate deploy` trên từng HTTP request.

**Quan trọng:** Lưu ý transaction pooling không hỗ trợ một số thao tác session. Theo hướng dẫn Neon, runtime serverless dùng pooled endpoint; quản trị schema dùng direct.

## 7. CORS, cookie, xác thực admin

- Cho phép đúng `FRONTEND_ORIGIN`; không `origin: '*'` đồng thời credentials.
- Nếu dùng session cookie cross-origin: nghiên cứu `SameSite=None; Secure`, CSRF; có thể dùng proxy cùng origin để giảm phức tạp. Không tùy tiện bật credentials không giới hạn.
- Xác thực phải nằm trên backend cho toàn bộ `POST/PATCH/DELETE /admin/...` và endpoint ký Cloudinary upload.
- Giới hạn số lần thử đăng nhập, timeout API ngoài, số request Places, độ dài payload và tốc độ upload.
- Tránh log mật khẩu, database URL, secret hoặc chính xác vị trí GPS của khách.

## 8. Places API và map

1. Mặc định `PLACES_ENABLED=false`: website vẫn hoạt động với quán do admin tạo.
2. Khi bật Google Places: bật billing và đặt quota/cảnh báo trong Google Cloud; hạn chế API key.
3. Backend chỉ yêu cầu FieldMask cần thiết; Google Places Nearby Search (New) giới hạn tối đa 20 kết quả/yêu cầu.
4. Google Places data hiển thị trên map -> dùng **Google Map**; ghi nguồn và không cache/lưu trái điều khoản.
5. Lỗi provider -> trả nội bộ kèm `meta.partialResults=true`.

## 9. Trình tự deploy khuyến nghị

- [ ] Đã tạo release tag/commit trạng thái ổn định.
- [ ] DB production có schema đúng; kiểm tra dữ liệu seed demo không hiển thị giả là quán thật.
- [ ] Deploy API trước; kiểm tra `https://.../api/v1/health` trả JSON.
- [ ] Kiểm tra kết nối DB, `GET /restaurants/nearby` với các tọa độ demo hợp lệ.
- [ ] Kiểm tra các biến environment thuộc đúng **Vercel Project**; không copy secret sang frontend.
- [ ] Deploy frontend; gắn `VITE_API_BASE_URL` trỏ đúng backend.
- [ ] Refresh trực tiếp `/explore`, `/wheel`, `/admin/login` không 404.
- [ ] Đăng nhập admin, thêm/sửa/ẩn một quán kiểm thử.
- [ ] Upload ảnh signed Cloudinary, hiển thị và xóa ảnh trong admin.
- [ ] GPS refused -> cho phép nhập địa điểm thủ công; 10 km được enforce backend.
- [ ] Vòng quay chỉ chọn ứng viên trong tập hợp lệ.
- [ ] Bật Google Places **sau cùng**, nếu đã xong compliance/chi phí.
- [ ] Test từ điện thoại, Lighthouse, tab Network, logs, CORS/cookie, HTTPS.
- [ ] Thiết lập cảnh báo quota/usage và kế hoạch sao lưu/phục hồi Neon.

## 10. Sự cố thường gặp

| Triệu chứng | Nguyên nhân thường gặp | Kiểm tra |
|---|---|---|
| Refresh `/wheel` bị 404 | Thiếu SPA rewrite | `frontend/vercel.json`, root directory |
| CORS error | Origin/cookie không khớp | `FRONTEND_ORIGIN`, credentials, response headers |
| API trả 404 | Route Function/entrypoint không map đúng | Express on Vercel và API logs |
| Prisma connection exhausted | Dùng direct URL cho mọi request | Neon pooled URL + connection reuse |
| Upload trả 401/403 | Session/cookie admin hoặc chữ ký sai | Auth middleware, timestamp, folder đã ký |
| Ảnh hiển thị 404 | public_id/secure_url sai hoặc xóa trước DB | Cloudinary dashboard, DB metadata |
| Google Places trả 429/billing | Vượt quota/billing chưa bật | Google Cloud quotas/budget, fallback nội bộ |
| Google map attribution lỗi | Dùng map renderer/nguồn sai | Places API policies, map configuration |

## Tài liệu chính thức

- https://vercel.com/docs/monorepos
- https://vercel.com/docs/frameworks/backend/express
- https://vercel.com/docs/frameworks/frontend/vite
- https://vercel.com/docs/plans/hobby
- https://neon.com/docs/connect/connection-pooling
- https://www.prisma.io/docs/orm/v7/reference/prisma-config-reference
- https://cloudinary.com/documentation/client_side_uploading
- https://developers.google.com/maps/documentation/places/web-service/policies
