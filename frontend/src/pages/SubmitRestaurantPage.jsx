import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Container from '../components/common/Container';
import PageTitle from '../components/common/PageTitle';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import MapLocationPicker from '../components/common/MapLocationPicker';
import ImageUpload from '../components/common/ImageUpload';
import { fetchApi } from '../utils/api';
import { ArrowLeft, CheckCircle2, MapPin, Share2, AlertCircle, Coffee, UtensilsCrossed, Beer, Sparkles } from 'lucide-react';

const DINING_TYPES = [
  { id: 'meal', label: 'Bữa chính (Cơm, phở, lẩu...)', icon: UtensilsCrossed },
  { id: 'snack', label: 'Ăn vặt (Chè, trà sữa, bánh rán...)', icon: Coffee },
  { id: 'drinking', label: 'Quán nhậu (Bia, mồi lai rai...)', icon: Beer },
];

export default function SubmitRestaurantPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    description: '',
    diningTypes: ['meal'],
    priceMin: '',
    priceMax: '',
    submitterName: '',
    submitterContact: '',
    note: '',
  });

  const [loadingGps, setLoadingGps] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);

  // Get current GPS
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Trình duyệt của bạn không hỗ trợ định vị GPS.');
      return;
    }

    setLoadingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setLoadingGps(false);
      },
      (err) => {
        alert('Không thể lấy tọa độ hiện tại. Bạn có thể nhập tay tọa độ hoặc địa chỉ.');
        setLoadingGps(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleToggleDiningType = (typeId) => {
    setFormData((prev) => {
      const exists = prev.diningTypes.includes(typeId);
      if (exists && prev.diningTypes.length === 1) return prev; // Keep at least 1
      return {
        ...prev,
        diningTypes: exists
          ? prev.diningTypes.filter((t) => t !== typeId)
          : [...prev.diningTypes, typeId],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim() || !formData.address.trim()) {
      setError('Vui lòng nhập tên quán và địa chỉ quán.');
      return;
    }

    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setError('Vui lòng nhập tọa độ (Vĩ độ / Kinh độ) hợp lệ hoặc bấm nút lấy vị trí hiện tại.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        latitude: lat,
        longitude: lng,
        description: formData.description.trim() || null,
        diningTypes: formData.diningTypes,
        priceMin: formData.priceMin ? parseInt(formData.priceMin, 10) : null,
        priceMax: formData.priceMax ? parseInt(formData.priceMax, 10) : null,
        imageUrl: uploadedImage?.secureUrl || null,
        cloudinaryPublicId: uploadedImage?.cloudinaryPublicId || null,
        submitterName: formData.submitterName.trim() || null,
        submitterContact: formData.submitterContact.trim() || null,
        note: formData.note.trim() || null,
      };

      await fetchApi('/submissions', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Không thể gửi đề xuất. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <Container className="max-w-xl py-12">
        <div className="bg-white rounded-3xl p-8 border border-[#EAE5DF] text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 bg-green-100 text-[#27865A] rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-[#252525]">Cảm ơn bạn đã chia sẻ quán!</h2>
            <p className="text-sm text-[#6B6B6B] leading-relaxed">
              Thông tin quán ăn <strong>"{formData.name}"</strong> đã được chuyển đến ban quản trị để kiểm duyệt. Quán sẽ chính thức xuất hiện trên bản đồ và vòng quay ngay sau khi duyệt!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              variant="primary"
              onClick={() => {
                setSuccess(false);
                setUploadedImage(null);
                setFormData({
                  name: '',
                  address: '',
                  latitude: '',
                  longitude: '',
                  description: '',
                  diningTypes: ['meal'],
                  priceMin: '',
                  priceMax: '',
                  submitterName: '',
                  submitterContact: '',
                  note: '',
                });
              }}
            >
              Chia sẻ quán khác
            </Button>
            <Link to="/explore">
              <Button variant="secondary">Khám phá các quán ăn</Button>
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="max-w-2xl py-6 space-y-6">
      <Link
        to="/explore"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF6B4A] hover:underline"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Quay lại khám phá
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE5DF] shadow-sm space-y-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FF6B4A]/10 text-[#FF6B4A] mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Cộng đồng ẩm thực
          </span>
          <PageTitle
            title="Chia sẻ quán ăn ngon"
            subtitle="Bạn biết một quán ăn ngon chưa có trên web? Hãy chia sẻ để mọi người cùng thưởng thức!"
            className="text-left"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-sm text-[#C73535]">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Tên quán ăn *"
            placeholder="Ví dụ: Phở Bò Cụ Chiêu, Chè Sầu Liên..."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Địa chỉ quán *"
            placeholder="Ví dụ: Số 12 Hàng Buồm, Hoàn Kiếm, Hà Nội"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />

          {/* Chọn vị trí & Tọa độ trên bản đồ */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#252525] uppercase tracking-wider">
              Vị trí & Tọa độ quán (Bấm trực tiếp vào bản đồ) *
            </label>
            <MapLocationPicker
              lat={formData.latitude ? parseFloat(formData.latitude) : 21.0285}
              lng={formData.longitude ? parseFloat(formData.longitude) : 105.8544}
              defaultAddress={formData.address}
              onChange={({ lat, lng, address }) => {
                setFormData((prev) => ({
                  ...prev,
                  latitude: String(lat),
                  longitude: String(lng),
                  address: address || prev.address,
                }));
              }}
              height="280px"
            />
            <div className="flex items-center gap-2 text-xs font-mono text-[#6B6B6B] bg-neutral-50 p-2.5 rounded-xl border border-[#EAE5DF]">
              <MapPin className="w-4 h-4 text-[#FF6B4A] shrink-0" />
              <span>Tọa độ đã chọn: <strong>{formData.latitude || '21.0285'}</strong>, <strong>{formData.longitude || '105.8544'}</strong></span>
            </div>
          </div>

          {/* Loại hình ăn uống */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#252525] uppercase tracking-wider">
              Loại hình ăn uống *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {DINING_TYPES.map((dt) => {
                const Icon = dt.icon;
                const selected = formData.diningTypes.includes(dt.id);
                return (
                  <button
                    key={dt.id}
                    type="button"
                    onClick={() => handleToggleDiningType(dt.id)}
                    className={`flex items-center gap-2 p-3 rounded-2xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                      selected
                        ? 'border-[#FF6B4A] bg-[#FF6B4A]/5 text-[#FF6B4A]'
                        : 'border-[#EAE5DF] bg-white text-[#252525] hover:bg-neutral-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{dt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Khoảng giá */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Giá từ (VNĐ)"
              type="number"
              placeholder="30000"
              value={formData.priceMin}
              onChange={(e) => setFormData({ ...formData, priceMin: e.target.value })}
            />
            <Input
              label="Giá đến (VNĐ)"
              type="number"
              placeholder="80000"
              value={formData.priceMax}
              onChange={(e) => setFormData({ ...formData, priceMax: e.target.value })}
            />
          </div>

          {/* Mô tả / Món ngon */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#252525] uppercase tracking-wider">
              Món ngon nổi bật & Cảm nhận của bạn
            </label>
            <textarea
              rows={3}
              className="w-full rounded-2xl border border-[#EAE5DF] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B4A] bg-white text-[#252525]"
              placeholder="Ví dụ: Quán có món phở tái lăn nước dùng rất đậm vị, mở từ 6h sáng đến 10h đêm..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Ảnh quán do người dùng chụp / chia sẻ */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#252525] uppercase tracking-wider">
              Ảnh chụp thực tế quán ăn / Món ăn (Tùy chọn)
            </label>
            <div className="p-4 bg-neutral-50 rounded-2xl border border-[#EAE5DF]">
              <ImageUpload
                onUploadSuccess={(res) => setUploadedImage(res)}
              />
            </div>
          </div>

          {/* Người chia sẻ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-[#EAE5DF] pt-4">
            <Input
              label="Tên người chia sẻ (Tùy chọn)"
              placeholder="Họ tên hoặc biệt danh"
              value={formData.submitterName}
              onChange={(e) => setFormData({ ...formData, submitterName: e.target.value })}
            />
            <Input
              label="Số điện thoại / Zalo (Tùy chọn)"
              placeholder="Để admin liên hệ khi cần"
              value={formData.submitterContact}
              onChange={(e) => setFormData({ ...formData, submitterContact: e.target.value })}
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={submitting}
            >
              <Share2 className="w-4 h-4 mr-2" />
              {submitting ? 'Đang gửi đề xuất...' : 'Gửi đề xuất quán cho Admin duyệt'}
            </Button>
          </div>
        </form>
      </div>
    </Container>
  );
}
