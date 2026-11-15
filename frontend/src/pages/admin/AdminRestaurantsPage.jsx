import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from '../../components/common/Container';
import Button from '../../components/common/Button';
import Skeleton from '../../components/common/Skeleton';
import ErrorState from '../../components/common/ErrorState';
import ImageUpload from '../../components/common/ImageUpload';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../utils/api';
import {
  Plus,
  EyeOff,
  Eye,
  Pencil,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ExternalLink,
  MapPin,
  Image as ImageIcon,
  X,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function AdminRestaurantsPage() {
  const navigate = useNavigate();
  const { user, token, logout, isAuthenticated, isAdmin, loading: authLoading } = useAuth();

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [photoModalRestaurant, setPhotoModalRestaurant] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Pagination state (20 items per page)
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 20;

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      navigate('/admin/login');
    }
  }, [authLoading, isAuthenticated, isAdmin, navigate]);

  const loadRestaurants = async (targetPage = page) => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetchApi(`/admin/restaurants?page=${targetPage}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const items = res.data || [];
      // Sắp xếp: Quán hiển thị (PUBLISHED) ở trên, quán ẩn (HIDDEN/DRAFT) ở dưới
      const sorted = [...items].sort((a, b) => {
        if (a.status === 'PUBLISHED' && b.status !== 'PUBLISHED') return -1;
        if (a.status !== 'PUBLISHED' && b.status === 'PUBLISHED') return 1;
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });

      setRestaurants(sorted);
      if (res.meta) {
        setPage(res.meta.page || 1);
        setTotalPages(res.meta.totalPages || 1);
        setTotalCount(res.meta.total || sorted.length);
      }
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách quán.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants(page);
  }, [token, page]);

  // Đổi trạng thái Ẩn <-> Hiển thị lại KHÔNG tải lại trang (In-place smooth update)
  const handleToggleStatus = async (id, currentStatus) => {
    const isCurrentlyPublished = currentStatus === 'PUBLISHED';
    const newStatus = isCurrentlyPublished ? 'HIDDEN' : 'PUBLISHED';
    const actionText = isCurrentlyPublished ? 'Ẩn quán' : 'Hiển thị lại quán';

    if (!window.confirm(`Bạn có chắc chắn muốn ${actionText.toLowerCase()} này khỏi/vào kết quả tìm kiếm?`)) return;

    try {
      setActionLoading(id);

      await fetchApi(`/admin/restaurants/${id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });

      // Cập nhật state trực tiếp tại chỗ không tải lại trang, tự động đẩy quán ẩn xuống dưới
      setRestaurants((prev) => {
        const updated = prev.map((r) =>
          r.id === id ? { ...r, status: newStatus, updatedAt: new Date().toISOString() } : r
        );
        return [...updated].sort((a, b) => {
          if (a.status === 'PUBLISHED' && b.status !== 'PUBLISHED') return -1;
          if (a.status !== 'PUBLISHED' && b.status === 'PUBLISHED') return 1;
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        });
      });
    } catch (err) {
      alert(err.message || `Lỗi khi thực hiện ${actionText.toLowerCase()}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePermanentDelete = async (id, name) => {
    if (!window.confirm(`CẢNH BÁO: Bạn có chắc chắn muốn XÓA VĨNH VIỄN quán "${name}" khỏi cơ sở dữ liệu? Toàn bộ món ăn và liên kết của quán sẽ bị xóa hoàn toàn.`)) return;
    try {
      setActionLoading(id);
      await fetchApi(`/admin/restaurants/${id}/permanent`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      // Xóa trực tiếp khỏi state
      setRestaurants((prev) => prev.filter((r) => r.id !== id));
      setTotalCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa quán vĩnh viễn');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUploadImageSuccess = async (uploadResult) => {
    if (!photoModalRestaurant || !token) return;
    try {
      setModalLoading(true);
      await fetchApi(`/admin/restaurants/${photoModalRestaurant.id}/images`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          cloudinaryPublicId: uploadResult.cloudinaryPublicId,
          secureUrl: uploadResult.secureUrl,
          width: uploadResult.width,
          height: uploadResult.height,
          altText: `Ảnh quán ${photoModalRestaurant.name}`,
        }),
      });

      // Cập nhật lại danh sách quán và modal state
      const newImg = {
        id: uploadResult.cloudinaryPublicId,
        cloudinaryPublicId: uploadResult.cloudinaryPublicId,
        secureUrl: uploadResult.secureUrl,
        altText: `Ảnh quán ${photoModalRestaurant.name}`,
      };

      setRestaurants((prev) =>
        prev.map((r) =>
          r.id === photoModalRestaurant.id
            ? { ...r, images: [...(r.images || []), newImg] }
            : r
        )
      );

      setPhotoModalRestaurant((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          images: [...(prev.images || []), newImg],
        };
      });
    } catch (err) {
      alert(err.message || 'Lỗi khi lưu ảnh vào cơ sở dữ liệu');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!photoModalRestaurant || !token) return;
    if (!window.confirm('Bạn có chắc chắn muốn xóa ảnh này khỏi quán và Cloudinary?')) return;

    try {
      setModalLoading(true);
      await fetchApi(`/admin/restaurants/${photoModalRestaurant.id}/images/${imageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      setRestaurants((prev) =>
        prev.map((r) =>
          r.id === photoModalRestaurant.id
            ? { ...r, images: (r.images || []).filter((img) => img.id !== imageId) }
            : r
        )
      );

      setPhotoModalRestaurant((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          images: (prev.images || []).filter((img) => img.id !== imageId),
        };
      });
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa ảnh');
    } finally {
      setModalLoading(false);
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
            Quản lý Quán Ăn ({totalCount})
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

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#EAE5DF] pb-3">
        <button
          type="button"
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#FF6B4A] text-white shadow-xs cursor-default"
        >
          Quán chính thức ({totalCount})
        </button>
        <Link
          to="/admin/submissions"
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-white text-[#252525] hover:bg-neutral-100 border border-[#EAE5DF] transition-colors"
        >
          Quán người dùng đề xuất
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadRestaurants(page)} />
      ) : restaurants.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-[#EAE5DF]">
          <p className="text-[#6B6B6B] mb-4">Chưa có quán nào trong hệ thống.</p>
          <Link to="/admin/restaurants/new">
            <Button variant="primary">Thêm quán đầu tiên</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
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
                  {restaurants.map((r) => {
                    const isHidden = r.status === 'HIDDEN';
                    return (
                      <tr
                        key={r.id}
                        className={`transition-colors ${
                          isHidden ? 'bg-neutral-50/70 opacity-75' : 'hover:bg-neutral-50/60'
                        }`}
                      >
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-[#252525] flex items-center gap-1.5">
                            <span>{r.name}</span>
                            {isHidden && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-200 text-[#6B6B6B] font-normal">
                                Đã ẩn
                              </span>
                            )}
                          </div>
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
                        <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                          {/* Nút sửa */}
                          <Link
                            to={`/admin/restaurants/${r.id}/edit`}
                            className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            title="Chỉnh sửa thông tin quán"
                          >
                            <Pencil className="w-3.5 h-3.5 mr-1" />
                            Sửa
                          </Link>

                          {/* Quản lý ảnh */}
                          <button
                            type="button"
                            onClick={() => setPhotoModalRestaurant(r)}
                            className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#FF6B4A]/10 text-[#FF6B4A] hover:bg-[#FF6B4A]/20 transition-colors cursor-pointer"
                          >
                            <ImageIcon className="w-3.5 h-3.5 mr-1" />
                            Ảnh ({r.images?.length || 0})
                          </button>

                          {/* Xem quán */}
                          <Link
                            to={`/restaurants/${r.slug || r.id}`}
                            target="_blank"
                            className="inline-flex items-center text-xs font-medium px-2 py-1 rounded text-[#6B6B6B] hover:text-[#252525] hover:bg-neutral-100"
                          >
                            <ExternalLink className="w-3.5 h-3.5 mr-1" />
                            Xem
                          </Link>

                          {/* Ẩn / Hiển thị lại */}
                          <button
                            type="button"
                            disabled={actionLoading === r.id}
                            onClick={() => handleToggleStatus(r.id, r.status)}
                            className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${
                              isHidden
                                ? 'bg-green-50 text-[#27865A] hover:bg-green-100'
                                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                            }`}
                            title={isHidden ? 'Hiển thị lại quán cho người dùng' : 'Ẩn quán khỏi kết quả tìm kiếm'}
                          >
                            {isHidden ? (
                              <>
                                <Eye className="w-3.5 h-3.5 mr-1" />
                                Hiển thị lại
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5 mr-1" />
                                Ẩn
                              </>
                            )}
                          </button>

                          {/* Xóa vĩnh viễn */}
                          <button
                            type="button"
                            disabled={actionLoading === r.id}
                            onClick={() => handlePermanentDelete(r.id, r.name)}
                            className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-50 text-[#C73535] hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50"
                            title="Xóa vĩnh viễn khỏi database"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            Xóa
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination bar (20 rows per page) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-[#EAE5DF] shadow-xs text-xs text-[#6B6B6B]">
            <div>
              Hiển thị <strong>{Math.min((page - 1) * limit + 1, totalCount)}</strong> -{' '}
              <strong>{Math.min(page * limit, totalCount)}</strong> trên tổng số <strong>{totalCount}</strong> quán
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#EAE5DF] bg-white font-medium text-[#252525] hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Trước
              </button>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pNum) => (
                <button
                  key={pNum}
                  type="button"
                  onClick={() => setPage(pNum)}
                  className={`w-8 h-8 rounded-xl font-bold transition-colors cursor-pointer ${
                    page === pNum
                      ? 'bg-[#FF6B4A] text-white shadow-xs'
                      : 'border border-[#EAE5DF] bg-white text-[#252525] hover:bg-neutral-50'
                  }`}
                >
                  {pNum}
                </button>
              ))}

              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#EAE5DF] bg-white font-medium text-[#252525] hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Sau
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Quản lý ảnh chính thống qua Cloudinary */}
      {photoModalRestaurant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-[#EAE5DF] space-y-6">
            <div className="flex items-center justify-between border-b border-[#EAE5DF] pb-4">
              <div>
                <span className="text-xs font-bold text-[#FF6B4A] uppercase">Quản lý ảnh chính thống (Cloudinary)</span>
                <h3 className="text-lg sm:text-xl font-extrabold text-[#252525]">
                  {photoModalRestaurant.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPhotoModalRestaurant(null)}
                className="p-1.5 rounded-full hover:bg-neutral-100 text-[#6B6B6B] hover:text-[#252525] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Danh sách ảnh hiện tại */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#6B6B6B] uppercase tracking-wider">
                Ảnh hiện có ({photoModalRestaurant.images?.length || 0})
              </h4>
              {(!photoModalRestaurant.images || photoModalRestaurant.images.length === 0) ? (
                <div className="p-4 bg-[#FFF9F2] border border-[#EAE5DF] rounded-2xl text-xs text-[#6B6B6B] text-center">
                  Chưa có ảnh nào được tải lên cho quán này. Hãy tải ảnh chính thống từ máy của bạn ở bên dưới.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {photoModalRestaurant.images.map((img) => (
                    <div key={img.id} className="relative group rounded-xl overflow-hidden border border-[#EAE5DF] aspect-[4/3] bg-neutral-100">
                      <img src={img.secureUrl} alt={img.altText || ''} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(img.id)}
                        disabled={modalLoading}
                        className="absolute top-2 right-2 p-1.5 bg-red-600/90 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 cursor-pointer shadow-md"
                        title="Xóa ảnh này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upload form */}
            <div className="border-t border-[#EAE5DF] pt-4 space-y-2">
              <span className="block text-xs font-bold text-[#252525] uppercase">
                Tải thêm ảnh mới từ máy tính:
              </span>
              <ImageUpload
                token={token}
                onUploadSuccess={handleUploadImageSuccess}
              />
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
