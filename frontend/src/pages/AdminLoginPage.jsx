import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../components/common/Container';
import PageTitle from '../components/common/PageTitle';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isAdmin } = useAuth();
  const [email, setEmail] = useState('admin@homnayangi.vn');
  const [password, setPassword] = useState('Admin@123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate('/admin/restaurants');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/admin/restaurants');
    } catch (err) {
      setError(err.message || 'Đăng nhập không thành công.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="max-w-md py-8">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE5DF] shadow-[0_6px_24px_rgba(37,37,37,0.07)]">
        <div className="w-12 h-12 rounded-2xl bg-[#FF6B4A]/10 text-[#FF6B4A] flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-6 h-6" />
        </div>

        <PageTitle
          title="Đăng nhập Quản trị"
          subtitle="Quản lý quán ăn, món và dữ liệu hệ thống"
        />

        {error && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-[#C73535] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Email quản trị"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            isLoading={loading}
          >
            Đăng nhập hệ thống
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#EAE5DF] text-center text-xs text-[#6B6B6B]">
          Tài khoản mặc định: <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono">admin@homnayangi.vn</code>
        </div>
      </div>
    </Container>
  );
}
