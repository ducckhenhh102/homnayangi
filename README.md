# Hôm Nay Ăn Gì?

Hệ thống đề xuất địa điểm ăn uống theo người đi cùng, nhu cầu ẩm thực và vị trí địa lý trong bán kính tối đa 10 km, tích hợp vòng quay ẩm thực và mô hình Hybrid (Neon PostgreSQL + Google Places API).

## Stack công nghệ chính thức

- **Frontend:** React + Vite + JavaScript, Tailwind CSS, React Router
- **Backend:** Node.js + Express (JavaScript, ESM), Zod
- **Database & ORM:** Neon PostgreSQL, Prisma ORM
- **Media Storage:** Cloudinary
- **Deployment:** Vercel (2 Projects: Frontend SPA + Backend Serverless Express)
- **External Provider (Hybrid):** Google Places API (New)

## Cấu trúc thư mục

```text
homnayangi/
├── frontend/     # Ứng dụng React + Vite (JS)
├── backend/      # Ứng dụng Express API (JS)
├── docs/         # Toàn bộ tài liệu kiến trúc, API, DB và lộ trình
├── .gitignore
└── README.md
```

## Tài liệu chi tiết

Toàn bộ tài liệu thiết kế và hướng dẫn thực hiện nằm trong thư mục `docs/`:
- [Tổng quan dự án](docs/PROJECT_OVERVIEW.md)
- [Design System & UI/UX](docs/SKILL_UI_UX.md)
- [Cơ sở dữ liệu (Neon + Prisma)](docs/DATABASE.md)
- [REST API Specification](docs/API.md)
- [Lưu trữ ảnh Cloudinary](docs/CLOUDINARY_STORAGE.md)
- [Cơ chế Hybrid Google Places](docs/HYBRID_PLACES.md)
- [Triển khai Vercel](docs/DEPLOYMENT_VERCEL.md)
- [Lộ trình chi tiết (Roadmap)](docs/ROADMAP_DETAILED.md)
