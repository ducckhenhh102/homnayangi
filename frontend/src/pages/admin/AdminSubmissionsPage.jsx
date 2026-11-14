import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from '../../components/common/Container';
import Button from '../../components/common/Button';
import Skeleton from '../../components/common/Skeleton';
import ErrorState from '../../components/common/ErrorState';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../utils/api';
import { CheckCircle2, XCircle, Trash2, ArrowLeft, LogOut, Clock, User, Phone, MapPin, AlertCircle, Utensils, Check } from 'lucide-react';

export default function AdminSubmissionsPage() {
  const navigate = useNavigate();
  const { user, token, logout, isAuthenticated, isAdmin, loading: authLoading } = useAuth();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('PENDING'); // 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      navigate('/admin/login');
    }
  }, [authLoading, isAuthenticated, isAdmin, navigate]);

  const loadSubmissions = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const query = statusFilter === 'ALL' ? '' : `?status=${statusFilter}`;
      const res = await fetchApi(`/admin/submissions${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubmissions(res.data || []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách đề xuất.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [token, statusFilter]);

  const handleApprove = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn duyệt quán "${name}" vào danh sách chính thức?`)) return;

    try {
      setActionLoading(id);
      await fetchApi(`/admin/submissions/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(`Đã duyệt thành công quán "${name}"! Quán đã xuất hiện chính thức trên web.`);
      await loadSubmissions();
    } catch (err) {
      alert(err.message || 'Lỗi khi duyệt quán');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id, name) => {
    const reason = window.prompt(`Lý do từ chối quán "${name}":`, 'Địa chỉ không chính xác hoặc trùng lặp');
    if (reason === null) return;

    try {
      setActionLoading(id);
      await fetchApi(`/admin/submissions/${id}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason }),
      });
      await loadSubmissions();
    } catch (err) {
      alert(err.message || 'Lỗi khi từ chối quán');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn đề xuất này?')) return;

    try {
      setActionLoading(id);
      await fetchApi(`/admin/submissions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadSubmissions();
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa đề xuất');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" /> Chờ duyệt
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-[#27865A]">
            <CheckCircle2 className="w-3 h-3" /> Đã duyệt
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-[#C73535]">
            <XCircle className="w-3 h-3" /> Từ chối
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
            Duyệt Quán Người Dùng Chia Sẻ
          </h1>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Đăng nhập với: <span className="font-semibold text-[#252525]">{user?.email}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/restaurants">
            <Button variant="secondary">
              Quay lại Quán chính thức
            </Button>
          </Link>

          <Button variant="secondary" onClick={logout}>
            <LogOut className="w-4 h-4 mr-1.5" />
            Đăng xuất
          </Button>
        </div>
      </div>

      {/* Tabs chuyển đổi giữa Quán chính thức và Quán người dùng đề xuất */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE5DF] pb-3">
        <div className="flex gap-2">
          <Link
            to="/admin/restaurants"
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-white text-[#252525] hover:bg-neutral-100 border border-[#EAE5DF] transition-colors"
          >
            Quán chính thức
          </Link>
          <button
            type="button"
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#FF6B4A] text-white shadow-xs cursor-default"
          >
            Quán người dùng đề xuất
          </button>
        </div>

        {/* Filter status */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[#6B6B6B] font-medium mr-1">Trạng thái:</span>
          {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-colors ${
                statusFilter === st
                  ? 'bg-[#252525] text-white'
                  : 'bg-neutral-100 text-[#6B6B6B] hover:bg-neutral-200'
              }`}
            >
              {st === 'PENDING' ? 'Chờ duyệt' : st === 'APPROVED' ? 'Đã duyệt' : st === 'REJECTED' ? 'Từ chối' : 'Tất cả'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={loadSubmissions} />
      ) : submissions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-[#EAE5DF]">
          <p className="text-[#6B6B6B]">Không có đề xuất quán nào trong mục này.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#EAE5DF] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-xs text-[#6B6B6B] uppercase border-b border-[#EAE5DF]">
                <tr>
                  <th className="px-4 py-3.5 font-semibold">Tên quán & Địa chỉ</th>
                  <th className="px-4 py-3.5 font-semibold">Loại hình & Giá</th>
                  <th className="px-4 py-3.5 font-semibold">Người chia sẻ</th>
                  <th className="px-4 py-3.5 font-semibold">Trạng thái</th>
                  <th className="px-4 py-3.5 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE5DF]">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="font-bold text-[#252525] text-base">{sub.name}</div>
                      <div className="text-xs text-[#6B6B6B] mt-0.5 line-clamp-2">{sub.address}</div>
                      <div className="text-[11px] text-[#FF6B4A] font-mono mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {sub.latitude.toFixed(4)}, {sub.longitude.toFixed(4)}
                      </div>
                      {sub.description && (
                        <div className="text-xs text-[#252525] bg-neutral-50 p-2 rounded-lg mt-2 border border-[#EAE5DF]/60">
                          "{sub.description}"
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1 mb-1">
                        {(sub.diningTypes || []).map((dt) => (
                          <span key={dt} className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#FF6B4A]/10 text-[#FF6B4A]">
                            {dt === 'meal' ? 'Bữa chính' : dt === 'snack' ? 'Ăn vặt' : 'Quán nhậu'}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-[#6B6B6B]">
                        {sub.priceMin && sub.priceMax
                          ? `${sub.priceMin.toLocaleString('vi-VN')}đ - ${sub.priceMax.toLocaleString('vi-VN')}đ`
                          : 'Chưa có giá'}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-xs text-[#6B6B6B]">
                      <div className="font-semibold text-[#252525] flex items-center gap-1">
                        <User className="w-3 h-3 text-[#FF6B4A]" />
                        {sub.submitterName || 'Ẩn danh'}
                      </div>
                      {sub.submitterContact && (
                        <div className="flex items-center gap-1 mt-0.5 text-[#252525]">
                          <Phone className="w-3 h-3 text-neutral-400" />
                          {sub.submitterContact}
                        </div>
                      )}
                      <div className="text-[11px] text-[#6B6B6B] mt-1">
                        {new Date(sub.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      {getStatusBadge(sub.status)}
                      {sub.rejectionReason && (
                        <div className="text-[11px] text-[#C73535] mt-1 italic">
                          Lý do: {sub.rejectionReason}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                      {sub.status === 'PENDING' && (
                        <>
                          <button
                            type="button"
                            disabled={actionLoading === sub.id}
                            onClick={() => handleApprove(sub.id, sub.name)}
                            className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-[#27865A] text-white hover:bg-[#206f4a] transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            Duyệt quán
                          </button>

                          <button
                            type="button"
                            disabled={actionLoading === sub.id}
                            onClick={() => handleReject(sub.id, sub.name)}
                            className="inline-flex items-center px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-neutral-100 text-[#C73535] hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            Từ chối
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        disabled={actionLoading === sub.id}
                        onClick={() => handleDelete(sub.id)}
                        className="inline-flex items-center p-1.5 rounded-lg text-[#6B6B6B] hover:text-[#C73535] hover:bg-neutral-100 cursor-pointer disabled:opacity-50"
                        title="Xóa đề xuất"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
