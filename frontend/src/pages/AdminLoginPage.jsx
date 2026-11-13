import React from 'react';
import Container from '../components/common/Container';
import PageTitle from '../components/common/PageTitle';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

export default function AdminLoginPage() {
  return (
    <Container className="max-w-md py-8">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#EAE5DF] shadow-[0_6px_24px_rgba(37,37,37,0.07)]">
        <PageTitle
          title="Đăng nhập Quản trị"
          subtitle="Dành cho admin quản lý quán, món và hình ảnh"
        />
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <Input
            label="Tên đăng nhập / Email"
            placeholder="admin@example.com"
            type="email"
          />
          <Input
            label="Mật khẩu"
            placeholder="••••••••"
            type="password"
          />
          <Button type="submit" variant="primary" className="w-full mt-2">
            Đăng nhập
          </Button>
        </form>
      </div>
    </Container>
  );
}
