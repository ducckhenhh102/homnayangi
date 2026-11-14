import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from '../../components/common/Container';
import Button from '../../components/common/Button';
import Skeleton from '../../components/common/Skeleton';
import ErrorState from '../../components/common/ErrorState';
import ImageUpload from '../../components/common/ImageUpload';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../utils/api';
import { Plus, EyeOff, CheckCircle2, AlertCircle, LogOut, ExternalLink, MapPin, Image as ImageIcon, X, Trash2 } from 'lucide-react';

export default function AdminRestaurantsPage() {
  const navigate = useNavigate();
  const { user, token, logout, isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [photoModalRestaurant, setPhotoModalRestaurant] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

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

  const handlePermanentDelete = async (id, name) => {
    if (!window.confirm(`CẢNH BÁO: Bạn có chắc chắn muốn XÓA VĨNH VIỄN quán "${name}" khỏi cơ sở dữ liệu? Toàn bộ món ăn và liên kết của quán sẽ bị xóa hoàn toàn.`)) return;
    try {
      setActionLoading(id);
      await fetchApi(`/admin/restaurants/${id}/permanent`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadRestaurants();
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

      // Reload restaurants to refresh image list
      await loadRestaurants();

      // Update active modal restaurant
      setPhotoModalRestaurant((prev) => {
        if (!prev) return null;
        const newImg = {
          id: uploadResult.cloudinaryPublicId,
          cloudinaryPublicId: uploadResult.cloudinaryPublicId,
          secureUrl: uploadResult.secureUrl,
          altText: `Ảnh quán ${prev.name}`,
        };
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

      await loadRestaurants();

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

      {/* Tabs chuyển đổi giữa Quán chính thức và Quán người dùng đề xuất */}
      <div className="flex items-center gap-2 border-b border-[#EAE5DF] pb-3">
        <button
          type="button"
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#FF6B4A] text-white shadow-xs cursor-default"
        >
          Quán chính thức ({restaurants.length})
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
                      <button
                        type="button"
                        onClick={() => setPhotoModalRestaurant(r)}
                        className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#FF6B4A]/10 text-[#FF6B4A] hover:bg-[#FF6B4A]/20 transition-colors cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5 mr-1" />
                        Ảnh ({r.images?.length || 0})
                      </button>

                      <Link
                        to={`/restaurants/${r.slug || r.id}`}
                        target="_blank"
                        className="inline-flex items-center text-xs text-[#6B6B6B] hover:text-[#252525] hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-1" />
                        Xem
                      </Link>

                      {r.status !== 'HIDDEN' && (
                        <button
                          type="button"
                          disabled={actionLoading === r.id}
                          onClick={() => handleHideRestaurant(r.id)}
                          className="inline-flex items-center text-xs text-amber-600 hover:underline cursor-pointer disabled:opacity-50"
                          title="Ẩn quán khỏi kết quả tìm kiếm"
                        >
                          <EyeOff className="w-3.5 h-3.5 mr-1" />
                          Ẩn
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={actionLoading === r.id}
                        onClick={() => handlePermanentDelete(r.id, r.name)}
                        className="inline-flex items-center text-xs text-[#C73535] hover:underline cursor-pointer disabled:opacity-50"
                        title="Xóa vĩnh viễn khỏi database"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                        disabled={modalLoading}
                        onClick={() => handleDeleteImage(img.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600/90 text-white hover:bg-red-700 opacity-90 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                        title="Xóa ảnh này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form tải ảnh mới lên Cloudinary */}
            <div className="space-y-3 border-t border-[#EAE5DF] pt-4">
              <h4 className="text-xs font-bold text-[#6B6B6B] uppercase tracking-wider">
                Tải ảnh mới từ máy của bạn
              </h4>
              <p className="text-xs text-[#6B6B6B]">
                Ảnh tải lên sẽ được ký bảo mật từ máy chủ và lưu trữ trực tiếp trên Cloudinary CDN của bạn.
              </p>
              <ImageUpload
                token={token}
                onUploadSuccess={handleUploadImageSuccess}
              />
            </div>

            <div className="flex justify-end pt-2 border-t border-[#EAE5DF]">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPhotoModalRestaurant(null)}
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
