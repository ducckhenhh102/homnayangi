import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Container from '../components/common/Container';
import Button from '../components/common/Button';
import Skeleton from '../components/common/Skeleton';
import ErrorState from '../components/common/ErrorState';
import { fetchApi } from '../utils/api';
import { ArrowLeft, MapPin, Tag, Utensils, Navigation, CheckCircle2, Heart, Users, User, Coffee, UtensilsCrossed, Beer } from 'lucide-react';

const DINING_NAME_MAP = {
  snack: { label: 'Ăn vặt', icon: Coffee },
  meal: { label: 'Ăn bình thường', icon: UtensilsCrossed },
  drinking: { label: 'Đi nhậu', icon: Beer },
};

export default function RestaurantDetailPage() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchApi(`/restaurants/${id}`);
      setRestaurant(res.data);
    } catch (err) {
      console.error('Lỗi tải chi tiết quán:', err);
      setError(err.message || 'Không tìm thấy quán ăn này.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  if (loading) {
    return (
      <Container className="max-w-4xl space-y-6">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-72 w-full rounded-3xl" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-24 w-full" />
      </Container>
    );
  }

  if (error || !restaurant) {
    return (
      <Container className="max-w-2xl py-12">
        <ErrorState
          title="Không thể tìm thấy quán"
          message={error || 'Quán bạn tìm không tồn tại hoặc đã bị ẩn.'}
          onRetry={loadDetail}
        />
        <div className="text-center mt-6">
          <Link to="/explore">
            <Button variant="secondary">Quay lại danh sách</Button>
          </Link>
        </div>
      </Container>
    );
  }

  const {
    name,
    address,
    description,
    location,
    diningTypes = [],
    priceMin,
    priceMax,
    images = [],
    foods = [],
  } = restaurant;

  // Directions URL
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;

  const formatPrice = () => {
    if (priceMin && priceMax) {
      return `${priceMin.toLocaleString('vi-VN')}đ - ${priceMax.toLocaleString('vi-VN')}đ`;
    }
    if (priceMin) {
      return `Từ ${priceMin.toLocaleString('vi-VN')}đ`;
    }
    return 'Chưa có thông tin giá';
  };

  return (
    <Container className="max-w-4xl space-y-8">
      {/* Back button */}
      <Link
        to="/explore"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#FF6B4A] hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại danh sách khám phá
      </Link>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-[#EAE5DF] overflow-hidden shadow-[0_6px_24px_rgba(37,37,37,0.06)]">
        {/* Banner image or placeholder */}
        <div className="relative h-64 sm:h-80 bg-neutral-100 overflow-hidden">
          {images.length > 0 ? (
            <img
              src={images[0].url}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#FFF9F2] text-[#6B6B6B]">
              <Utensils className="w-16 h-16 text-[#FF6B4A]/40 mb-2" />
              <span className="font-semibold text-sm">Hình ảnh do quán cập nhật</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Header info */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                {diningTypes.map((dt) => {
                  const item = DINING_NAME_MAP[dt];
                  return (
                    <span
                      key={dt}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FFB84D]/20 text-[#966417]"
                    >
                      {item ? item.label : dt}
                    </span>
                  );
                })}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#252525]">
                {name}
              </h1>

              <div className="flex items-start gap-1.5 text-sm text-[#6B6B6B] mt-2">
                <MapPin className="w-4 h-4 shrink-0 text-[#FF6B4A] mt-0.5" />
                <span>{address}</span>
              </div>
            </div>

            {/* Direction CTA */}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <Button variant="primary" size="md">
                <Navigation className="w-4 h-4 mr-2" />
                Chỉ đường (Maps)
              </Button>
            </a>
          </div>

          <div className="border-t border-[#EAE5DF]" />

          {/* Description & Price */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              <h3 className="font-bold text-base text-[#252525]">Giới thiệu quán</h3>
              <p className="text-sm text-[#6B6B6B] leading-relaxed">
                {description || 'Chưa có thông tin mô tả chi tiết cho quán này.'}
              </p>
            </div>

            <div className="p-4 bg-[#FFF9F2] rounded-2xl border border-[#EAE5DF] space-y-2">
              <div className="text-xs font-semibold text-[#6B6B6B]">Khoảng giá ước tính</div>
              <div className="text-base font-bold text-[#27865A] flex items-center gap-1.5">
                <Tag className="w-4 h-4" />
                <span>{formatPrice()}</span>
              </div>
              <div className="text-[11px] text-[#6B6B6B]">
                Giá thực tế có thể thay đổi tùy theo menu và thời điểm phục vụ.
              </div>
            </div>
          </div>

          {/* Menu / Sample Foods */}
          {foods.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-[#EAE5DF]">
              <h3 className="font-bold text-lg text-[#252525] flex items-center gap-2">
                <Utensils className="w-5 h-5 text-[#FF6B4A]" />
                Món ngon tại quán
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {foods.map((food) => (
                  <div
                    key={food.id}
                    className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-xl border border-[#EAE5DF]"
                  >
                    <div>
                      <div className="font-semibold text-sm text-[#252525]">{food.name}</div>
                      {food.category && (
                        <div className="text-xs text-[#6B6B6B]">{food.category}</div>
                      )}
                    </div>
                    {food.priceVnd && (
                      <span className="text-xs font-bold text-[#FF6B4A]">
                        {food.priceVnd.toLocaleString('vi-VN')}đ
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
