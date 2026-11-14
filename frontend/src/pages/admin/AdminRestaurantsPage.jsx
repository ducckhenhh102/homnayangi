import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from '../../components/common/Container';
import Button from '../../components/common/Button';
import Skeleton from '../../components/common/Skeleton';
import ErrorState from '../../components/common/ErrorState';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../utils/api';
import { Plus, EyeOff, CheckCircle2, AlertCircle, LogOut, ExternalLink, MapPin } from 'lucide-react';

export default function AdminRestaurantsPage() {
  const navigate = useNavigate();
  const { user, token, logout, isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      navigate('/admin/login');
    }
  }, [authLoading, isAuthenticated, isAdmin, navigate]);

  const loadRestaurants = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetchApi('/admin/restaurants', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRestaurants(res.data || []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách quán.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, [token]);

  const handleHideRestaurant = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn ẩn quán này khỏi tìm kiếm?')) return;
    try {
      setActionLoading(id);
      await fetchApi(`/admin/restaurants/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadRestaurants();
    } catch (err) {
      alert(err.message || 'Lỗi khi ẩn quán');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-[#27865A]">
            <CheckCircle2 className="w-3 h-3" /> Hiển thị
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
            Bản nháp
          </span>
        );
      case 'HIDDEN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-200 text-[#6B6B6B]">
            <EyeOff className="w-3 h-3" /> Đã ẩn
          </span>
        );
      default:
        return status;
    }
  };

  return (
    <Container className="space-y-6 py-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE5DF] pb-5">
        <div>
          <span className="text-xs font-bold text-[#FF6B4A] uppercase tracking-wider">Khu vực quản trị</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#252525]">
            Danh sách Quán Ăn ({restaurants.length})
          </h1>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Đăng nhập với: <span className="font-semibold text-[#252525]">{user?.email}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/restaurants/new">
            <Button variant="primary">
              <Plus className="w-4 h-4 mr-1.5" />
              Thêm quán mới
            </Button>
          </Link>

          <Button variant="secondary" onClick={logout}>
            <LogOut className="w-4 h-4 mr-1.5" />
            Đăng xuất
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={loadRestaurants} />
      ) : restaurants.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-[#EAE5DF]">
          <p className="text-[#6B6B6B] mb-4">Chưa có quán nào trong hệ thống.</p>
          <Link to="/admin/restaurants/new">
            <Button variant="primary">Thêm quán đầu tiên</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#EAE5DF] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-xs text-[#6B6B6B] uppercase border-b border-[#EAE5DF]">
                <tr>
                  <th className="px-4 py-3.5 font-semibold">Tên quán & Slug</th>
                  <th className="px-4 py-3.5 font-semibold">Trạng thái</th>
                  <th className="px-4 py-3.5 font-semibold">Địa chỉ & Tọa độ</th>
                  <th className="px-4 py-3.5 font-semibold">Số món</th>
                  <th className="px-4 py-3.5 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE5DF]">
                {restaurants.map((r) => (
                  <tr key={r.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-[#252525]">{r.name}</div>
                      <div className="text-xs text-[#6B6B6B] font-mono">{r.slug}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      {getStatusBadge(r.status)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-xs text-[#252525] line-clamp-1 max-w-xs">{r.address}</div>
                      <div className="text-[11px] text-[#6B6B6B]">
                        {r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-[#252525] font-semibold">
                      {r._count?.foods || 0} món
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <Link
                        to={`/restaurants/${r.slug || r.id}`}
                        target="_blank"
                        className="inline-flex items-center text-xs text-[#FF6B4A] hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-1" />
                        Xem
                      </Link>

                      {r.status !== 'HIDDEN' && (
                        <button
                          type="button"
                          disabled={actionLoading === r.id}
                          onClick={() => handleHideRestaurant(r.id)}
                          className="inline-flex items-center text-xs text-[#C73535] hover:underline cursor-pointer disabled:opacity-50"
                        >
                          <EyeOff className="w-3.5 h-3.5 mr-1" />
                          Ẩn quán
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Container>
  );
}
