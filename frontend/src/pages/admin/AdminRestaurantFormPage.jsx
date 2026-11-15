import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import Container from '../../components/common/Container';
import PageTitle from '../../components/common/PageTitle';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ImageUpload from '../../components/common/ImageUpload';
import MapLocationPicker from '../../components/common/MapLocationPicker';
import Skeleton from '../../components/common/Skeleton';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../utils/api';
import { ArrowLeft, PlusCircle, AlertCircle, MapPin, Save, UtensilsCrossed, Trash2, Plus } from 'lucide-react';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export default function AdminRestaurantFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { token, isAuthenticated, isAdmin, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    address: '',
    latitude: '21.0285',
    longitude: '105.8542',
    priceMin: '',
    priceMax: '',
    status: 'PUBLISHED',
    description: '',
    diningTypeIds: ['meal'],
    companionScores: [
      { companionTypeId: 'couple', score: 85 },
      { companionTypeId: 'friends', score: 90 },
      { companionTypeId: 'solo', score: 70 },
    ],
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [foodItems, setFoodItems] = useState([
    { name: '', priceVnd: '', category: 'Món đặc trưng' },
  ]);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      navigate('/admin/login');
    }
  }, [authLoading, isAuthenticated, isAdmin, navigate]);

  // Load existing restaurant for edit mode
  useEffect(() => {
    if (isEditMode && token) {
      setInitialLoading(true);
      fetchApi(`/admin/restaurants/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          const r = res.data;
          if (r) {
            setFormData({
              name: r.name || '',
              slug: r.slug || '',
              address: r.address || '',
              latitude: r.latitude !== undefined && r.latitude !== null ? String(r.latitude) : '21.0285',
              longitude: r.longitude !== undefined && r.longitude !== null ? String(r.longitude) : '105.8542',
              priceMin: r.priceMin ? String(r.priceMin) : '',
              priceMax: r.priceMax ? String(r.priceMax) : '',
              status: r.status || 'PUBLISHED',
              description: r.description || '',
              diningTypeIds: r.diningTypes && r.diningTypes.length > 0
                ? r.diningTypes.map((dt) => dt.diningTypeId || dt.id)
                : ['meal'],
              companionScores: [
                { companionTypeId: 'couple', score: 85 },
                { companionTypeId: 'friends', score: 90 },
                { companionTypeId: 'solo', score: 70 },
              ],
            });

            if (r.foods && r.foods.length > 0) {
              setFoodItems(
                r.foods.map((rf) => ({
                  name: rf.food?.name || '',
                  priceVnd: rf.priceVnd != null ? String(rf.priceVnd) : (rf.food?.priceVnd ? String(rf.food.priceVnd) : ''),
                  category: rf.food?.category || 'Món đặc trưng',
                }))
              );
            }
          }
        })
        .catch((err) => {
          setError(err.message || 'Không thể tải thông tin quán để chỉnh sửa.');
        })
        .finally(() => setInitialLoading(false));
    }
  }, [id, isEditMode, token]);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: !isEditMode && (prev.slug === '' || prev.slug === slugify(prev.name)) ? slugify(val) : prev.slug,
    }));
  };

  const handleSlugChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      slug: slugify(val),
    }));
  };

  const handleDiningToggle = (dtId) => {
    setFormData((prev) => {
      const exists = prev.diningTypeIds.includes(dtId);
      if (exists && prev.diningTypeIds.length === 1) return prev; // must keep at least one
      return {
        ...prev,
        diningTypeIds: exists
          ? prev.diningTypeIds.filter((item) => item !== dtId)
          : [...prev.diningTypeIds, dtId],
      };
    });
  };

  const handleAddFoodItem = () => {
    setFoodItems((prev) => [...prev, { name: '', priceVnd: '', category: 'Món đặc trưng' }]);
  };

  const handleRemoveFoodItem = (index) => {
    setFoodItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFoodItemChange = (index, field, value) => {
    setFoodItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const parsedLat = parseFloat(formData.latitude) || 21.0285;
      const parsedLng = parseFloat(formData.longitude) || 105.8542;
      const finalAddress = formData.address.trim().length >= 5
        ? formData.address.trim()
        : `Tọa độ ${parsedLat.toFixed(4)}, ${parsedLng.toFixed(4)}, Hà Nội`;

      const validFoods = foodItems
        .filter((f) => f.name && f.name.trim().length > 0)
        .map((f) => ({
          name: f.name.trim(),
          priceVnd: f.priceVnd ? parseInt(f.priceVnd, 10) : null,
          category: f.category || 'Món đặc trưng',
        }));

      const payload = {
        name: formData.name.trim(),
        slug: slugify(formData.slug) || slugify(formData.name) || `quan-${Date.now()}`,
        address: finalAddress,
        latitude: parsedLat,
        longitude: parsedLng,
        description: formData.description.trim() || null,
        priceMin: formData.priceMin ? parseInt(formData.priceMin, 10) : null,
        priceMax: formData.priceMax ? parseInt(formData.priceMax, 10) : null,
        status: formData.status,
        diningTypeIds: formData.diningTypeIds,
        foodItems: validFoods,
      };

      if (isEditMode) {
        await fetchApi(`/admin/restaurants/${id}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        // If new image was uploaded, attach it
        if (uploadedImage) {
          await fetchApi(`/admin/restaurants/${id}/images`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              cloudinaryPublicId: uploadedImage.cloudinaryPublicId,
              secureUrl: uploadedImage.secureUrl,
              width: uploadedImage.width,
              height: uploadedImage.height,
              altText: `Ảnh quán ${formData.name}`,
            }),
          });
        }
      } else {
        const created = await fetchApi('/admin/restaurants', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...payload,
            companionScores: formData.companionScores,
          }),
        });

        // If image was uploaded to Cloudinary, attach it to the new restaurant
        const newId = created.data?.rawId || created.data?.id?.replace('internal:', '');
        if (uploadedImage && newId) {
          await fetchApi(`/admin/restaurants/${newId}/images`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              cloudinaryPublicId: uploadedImage.cloudinaryPublicId,
              secureUrl: uploadedImage.secureUrl,
              width: uploadedImage.width,
              height: uploadedImage.height,
              altText: `Ảnh quán ${formData.name}`,
            }),
          });
        }
      }

      navigate('/admin/restaurants');
    } catch (err) {
      const detailsMsg = err.details?.map((d) => d.message).filter(Boolean).join('; ');
      setError(detailsMsg ? `${err.message} (${detailsMsg})` : (err.message || `Không thể ${isEditMode ? 'cập nhật' : 'tạo'} quán ăn.`));
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Container className="max-w-3xl py-6 space-y-6">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full rounded-3xl" />
      </Container>
    );
  }

  return (
    <Container className="max-w-3xl py-6 space-y-6">
      <Link
        to="/admin/restaurants"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF6B4A] hover:underline"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Quay lại danh sách quản trị
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE5DF] shadow-sm">
        <PageTitle
          title={isEditMode ? `Chỉnh sửa quán: ${formData.name || 'Quán ăn'}` : 'Thêm quán ăn mới'}
          subtitle={isEditMode ? 'Cập nhật thông tin quán trực tiếp vào cơ sở dữ liệu' : 'Dữ liệu sẽ được lưu trực tiếp vào Neon PostgreSQL và có thể tìm kiếm ngay'}
          className="text-left"
        />

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-[#C73535] flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Tên quán ăn *"
              placeholder="VD: Bún Chả Sinh Từ"
              value={formData.name}
              onChange={handleNameChange}
              required
            />
            <div>
              <Input
                label="Slug (đường dẫn URL) *"
                placeholder="bun-cha-sinh-tu"
                value={formData.slug}
                onChange={handleSlugChange}
                required
              />
              <span className="block text-[11px] text-[#6B6B6B] mt-1 truncate">
                Đường dẫn xem: /restaurants/<strong>{formData.slug || 'slug-quan-an'}</strong>
              </span>
            </div>
          </div>

          <Input
            label="Địa chỉ chi tiết *"
            placeholder="Số nhà, đường, phường/quận, thành phố"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />

          {/* Coordinates Map Picker */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#6B6B6B] uppercase">
              <MapPin className="w-4 h-4 text-[#FF6B4A]" />
              <span>Vị trí & Tọa độ quán (Bấm trực tiếp trên bản đồ) *</span>
            </div>
            <MapLocationPicker
              lat={formData.latitude ? parseFloat(formData.latitude) : 21.0285}
              lng={formData.longitude ? parseFloat(formData.longitude) : 105.8542}
              defaultAddress={formData.address}
              onChange={({ lat, lng, address }) => {
                setFormData((prev) => ({
                  ...prev,
                  latitude: String(lat),
                  longitude: String(lng),
                  address: prev.address ? prev.address : address,
                }));
              }}
              height="260px"
            />
            <div className="flex items-center gap-2 text-xs font-mono text-[#6B6B6B] bg-neutral-50 p-2.5 rounded-xl border border-[#EAE5DF]">
              <span>Tọa độ đã chọn: <strong>{formData.latitude}</strong> (Vĩ độ), <strong>{formData.longitude}</strong> (Kinh độ)</span>
            </div>
          </div>

          {/* Image Upload */}
          <div className="p-4 bg-neutral-50 rounded-2xl border border-[#EAE5DF]">
            <span className="block text-xs font-bold text-[#252525] uppercase mb-2">
              {isEditMode ? 'Tải thêm ảnh mới cho quán (Tùy chọn)' : 'Ảnh đại diện quán'}
            </span>
            <ImageUpload
              token={token}
              onUploadSuccess={(res) => setUploadedImage(res)}
            />
          </div>

          {/* Dining Types */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#252525]">
              Phong cách ăn uống * (chọn ít nhất 1)
            </label>
            <div className="flex flex-wrap gap-3">
              {[
                { id: 'snack', label: 'Ăn vặt' },
                { id: 'meal', label: 'Ăn bình thường' },
                { id: 'drinking', label: 'Đi nhậu' },
              ].map((dt) => {
                const checked = formData.diningTypeIds.includes(dt.id);
                return (
                  <label
                    key={dt.id}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium cursor-pointer transition-colors ${
                      checked
                        ? 'bg-[#FF6B4A]/10 border-[#FF6B4A] text-[#FF6B4A]'
                        : 'bg-white border-[#EAE5DF] text-[#252525]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleDiningToggle(dt.id)}
                      className="accent-[#FF6B4A]"
                    />
                    <span>{dt.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Price Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Giá tối thiểu (VNĐ)"
              type="number"
              placeholder="30000"
              value={formData.priceMin}
              onChange={(e) => setFormData({ ...formData, priceMin: e.target.value })}
            />
            <Input
              label="Giá tối đa (VNĐ)"
              type="number"
              placeholder="80000"
              value={formData.priceMax}
              onChange={(e) => setFormData({ ...formData, priceMax: e.target.value })}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-[#252525] mb-1.5">
              Trạng thái xuất bản
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full min-h-[44px] px-3.5 py-2.5 bg-white border border-[#EAE5DF] rounded-xl text-[#252525] focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]"
            >
              <option value="PUBLISHED">Công khai (Hiển thị ngay cho người dùng)</option>
              <option value="HIDDEN">Đã ẩn (Ẩn khỏi kết quả tìm kiếm)</option>
              <option value="DRAFT">Bản nháp (Chưa hiển thị)</option>
            </select>
          </div>

          {/* Food Menu Items */}
          <div className="p-4 bg-neutral-50 rounded-2xl border border-[#EAE5DF] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-[#FF6B4A]" />
                <span className="text-sm font-bold text-[#252525]">Món ăn tiêu biểu của quán (Tùy chọn)</span>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddFoodItem}
                className="text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Thêm món
              </Button>
            </div>
            <p className="text-xs text-[#6B6B6B]">
              Thêm các món ăn nổi bật hoặc đặc sản để hiển thị trong thực đơn chi tiết của quán.
            </p>

            {foodItems.length === 0 ? (
              <div className="text-center py-4 text-xs text-[#6B6B6B] bg-white rounded-xl border border-dashed border-[#EAE5DF]">
                Chưa có món nào. Bấm <strong>"+ Thêm món"</strong> để thêm món ăn cho quán.
              </div>
            ) : (
              <div className="space-y-2">
                {foodItems.map((item, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 bg-white p-2.5 rounded-xl border border-[#EAE5DF]">
                    <div className="flex-1 w-full">
                      <input
                        type="text"
                        placeholder="Tên món (VD: Nem rán giòn, Trà sữa trân châu)..."
                        value={item.name}
                        onChange={(e) => handleFoodItemChange(idx, 'name', e.target.value)}
                        className="w-full text-xs py-1.5 px-3 rounded-lg border border-[#EAE5DF] focus:outline-none focus:ring-1 focus:ring-[#FF6B4A]"
                      />
                    </div>
                    <div className="w-full sm:w-36">
                      <input
                        type="number"
                        placeholder="Giá (VNĐ)"
                        value={item.priceVnd}
                        onChange={(e) => handleFoodItemChange(idx, 'priceVnd', e.target.value)}
                        className="w-full text-xs py-1.5 px-3 rounded-lg border border-[#EAE5DF] focus:outline-none focus:ring-1 focus:ring-[#FF6B4A]"
                      />
                    </div>
                    <div className="w-full sm:w-36">
                      <input
                        type="text"
                        placeholder="Nhóm (VD: Món chính)"
                        value={item.category}
                        onChange={(e) => handleFoodItemChange(idx, 'category', e.target.value)}
                        className="w-full text-xs py-1.5 px-3 rounded-lg border border-[#EAE5DF] focus:outline-none focus:ring-1 focus:ring-[#FF6B4A]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFoodItem(idx)}
                      className="p-1.5 text-neutral-400 hover:text-red-500 rounded-lg hover:bg-red-50 cursor-pointer shrink-0 transition-colors"
                      title="Xóa món này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-[#252525] mb-1.5">
              Mô tả quán
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Không gian, điểm đặc sắc, gợi ý món ngon..."
              className="w-full p-3.5 bg-white border border-[#EAE5DF] rounded-xl text-sm text-[#252525] focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-[#C73535] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-4 border-t border-[#EAE5DF] flex items-center justify-end gap-3">
            <Link to="/admin/restaurants">
              <Button variant="secondary">Hủy bỏ</Button>
            </Link>
            <Button type="submit" variant="primary" isLoading={loading}>
              {isEditMode ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Lưu thay đổi quán ăn
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Lưu quán ăn mới
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Container>
  );
}
