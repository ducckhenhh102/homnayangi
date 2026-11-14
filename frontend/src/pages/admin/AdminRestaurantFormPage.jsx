import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Container from '../../components/common/Container';
import PageTitle from '../../components/common/PageTitle';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ImageUpload from '../../components/common/ImageUpload';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../utils/api';
import { ArrowLeft, PlusCircle, AlertCircle, MapPin } from 'lucide-react';

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
  const { token } = useAuth();

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
  const [error, setError] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: prev.slug === '' || prev.slug === slugify(prev.name) ? slugify(val) : prev.slug,
    }));
  };

  const handleDiningToggle = (dtId) => {
    setFormData((prev) => {
      const exists = prev.diningTypeIds.includes(dtId);
      if (exists && prev.diningTypeIds.length === 1) return prev; // must keep at least one
      return {
        ...prev,
        diningTypeIds: exists
          ? prev.diningTypeIds.filter((id) => id !== dtId)
          : [...prev.diningTypeIds, dtId],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        address: formData.address.trim(),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        description: formData.description.trim() || null,
        priceMin: formData.priceMin ? parseInt(formData.priceMin, 10) : null,
        priceMax: formData.priceMax ? parseInt(formData.priceMax, 10) : null,
        status: formData.status,
        diningTypeIds: formData.diningTypeIds,
        companionScores: formData.companionScores,
      };

      const created = await fetchApi('/admin/restaurants', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // If image was uploaded to Cloudinary, attach it to the new restaurant
      if (uploadedImage && created.data?.rawId) {
        await fetchApi(`/admin/restaurants/${created.data.rawId}/images`, {
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

      navigate('/admin/restaurants');
    } catch (err) {
      setError(err.message || 'Không thể tạo quán mới.');
    } finally {
      setLoading(false);
    }
  };

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
          title="Thêm quán ăn mới"
          subtitle="Dữ liệu sẽ được lưu trực tiếp vào Neon PostgreSQL và có thể tìm kiếm ngay"
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
            <Input
              label="Slug (đường dẫn) *"
              placeholder="bun-cha-sinh-tu"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
            />
          </div>

          <Input
            label="Địa chỉ chi tiết *"
            placeholder="Số nhà, đường, phường/quận, thành phố"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />

          {/* Coordinates */}
          <div className="p-4 bg-neutral-50 rounded-2xl border border-[#EAE5DF] space-y-3">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-[#252525]">
              <MapPin className="w-4 h-4 text-[#FF6B4A]" />
              <span>Tọa độ WGS84 (Dùng để tính bán kính 10 km)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Vĩ độ (Latitude: -90 đến 90)"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                required
              />
              <Input
                label="Kinh độ (Longitude: -180 đến 180)"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="p-4 bg-neutral-50 rounded-2xl border border-[#EAE5DF]">
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
              <option value="DRAFT">Bản nháp (Chưa hiển thị)</option>
            </select>
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

          <div className="pt-4 border-t border-[#EAE5DF] flex items-center justify-end gap-3">
            <Link to="/admin/restaurants">
              <Button variant="secondary">Hủy bỏ</Button>
            </Link>
            <Button type="submit" variant="primary" isLoading={loading}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Lưu quán ăn mới
            </Button>
          </div>
        </form>
      </div>
    </Container>
  );
}
