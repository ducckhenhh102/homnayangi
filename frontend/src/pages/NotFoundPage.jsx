import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/common/Container';
import Button from '../components/common/Button';

export default function NotFoundPage() {
  return (
    <Container className="text-center py-16">
      <h1 className="text-6xl font-black text-[#FF6B4A] mb-4">404</h1>
      <h2 className="text-2xl font-bold text-[#252525] mb-2">Không tìm thấy trang</h2>
      <p className="text-[#6B6B6B] mb-8">Trang bạn đang tìm kiếm không tồn tại hoặc đã được chuyển đi.</p>
      <Link to="/">
        <Button variant="primary">Về trang chủ</Button>
      </Link>
    </Container>
  );
}
