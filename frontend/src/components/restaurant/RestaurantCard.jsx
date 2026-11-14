import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Utensils, Tag, Heart } from 'lucide-react';
import Card from '../common/Card';

const DINING_NAME_MAP = {
  snack: 'Ăn vặt',
  meal: 'Ăn bình thường',
  drinking: 'Đi nhậu',
};

const COMPANION_NAME_MAP = {
  couple: 'Người yêu',
  friends: 'Nhóm bạn',
  solo: 'Một mình',
};

export default function RestaurantCard({ restaurant }) {
  const {
    id,
    slug,
    name,
    address,
    imageUrl,
    diningTypes = [],
    companionTypes = [],
    priceMin,
    priceMax,
    distanceKm,
    description,
  } = restaurant;

  const targetId = slug || id;

  // Format price display
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
    <Card className="flex flex-col h-full overflow-hidden p-0 group">
      <Link to={`/restaurants/${targetId}`} className="block relative aspect-[4/3] bg-neutral-100 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#6B6B6B] bg-[#FFF9F2] p-4 text-center">
            <Utensils className="w-10 h-10 text-[#FF6B4A]/50 mb-2" />
            <span className="text-xs font-medium text-[#6B6B6B]">Hôm Nay Ăn Gì</span>
          </div>
        )}

        {/* Distance Badge if available */}
        {distanceKm !== undefined && distanceKm !== null && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-[#FF6B4A] shadow-sm">
            {distanceKm.toFixed(1)} km
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1">
        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {diningTypes.map((dt) => (
            <span
              key={dt}
              className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#FFB84D]/20 text-[#966417]"
            >
              {DINING_NAME_MAP[dt] || dt}
            </span>
          ))}
          {companionTypes.slice(0, 2).map((ct) => (
            <span
              key={ct}
              className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#FF6B4A]/10 text-[#FF6B4A]"
            >
              {COMPANION_NAME_MAP[ct] || ct}
            </span>
          ))}
        </div>

        {/* Name */}
        <Link to={`/restaurants/${targetId}`} className="hover:text-[#FF6B4A] transition-colors">
          <h3 className="font-bold text-base text-[#252525] line-clamp-1 mb-1">
            {name}
          </h3>
        </Link>

        {/* Address */}
        <div className="flex items-start gap-1.5 text-xs text-[#6B6B6B] mb-3 line-clamp-2">
          <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#FF6B4A]" />
          <span>{address}</span>
        </div>

        {/* Price & Link */}
        <div className="mt-auto pt-3 border-t border-[#EAE5DF] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 font-semibold text-[#27865A]">
            <Tag className="w-3.5 h-3.5" />
            <span>{formatPrice()}</span>
          </div>
          <Link
            to={`/restaurants/${targetId}`}
            className="text-[#FF6B4A] font-semibold hover:underline"
          >
            Chi tiết →
          </Link>
        </div>
      </div>
    </Card>
  );
}
