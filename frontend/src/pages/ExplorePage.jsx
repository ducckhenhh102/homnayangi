import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from '../components/common/Container';
import PageTitle from '../components/common/PageTitle';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import { useDiscovery } from '../context/DiscoveryContext';
import { Heart, Users, User, Coffee, UtensilsCrossed, Beer, MapPin, Disc3, SlidersHorizontal, ArrowLeft } from 'lucide-react';

const COMPANION_LABELS = {
  couple: { label: 'Người yêu', icon: Heart },
  friends: { label: 'Nhóm bạn', icon: Users },
  solo: { label: 'Một mình', icon: User },
};

const DINING_LABELS = {
  snack: { label: 'Ăn vặt', icon: Coffee },
  meal: { label: 'Ăn bình thường', icon: UtensilsCrossed },
  drinking: { label: 'Đi nhậu', icon: Beer },
};

export default function ExplorePage() {
  const navigate = useNavigate();
  const { preferences } = useDiscovery();
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'map'

  const companion = COMPANION_LABELS[preferences.companion] || COMPANION_LABELS.couple;
  const dining = DINING_LABELS[preferences.diningType] || DINING_LABELS.meal;
  const CompanionIcon = companion.icon;
  const DiningIcon = dining.icon;

  return (
    <Container className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF6B4A] hover:underline mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Thay đổi lựa chọn
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#252525]">
            Địa điểm gợi ý cho bạn
          </h1>
        </div>

        <Button
          variant="accent"
          size="md"
          onClick={() => navigate('/wheel')}
        >
          <Disc3 className="w-4 h-4 mr-2" />
          Vòng quay chọn ngẫu nhiên
        </Button>
      </div>

      {/* Filter summary bar */}
      <div className="p-4 bg-white border border-[#EAE5DF] rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-[#6B6B6B]">Đang lọc theo:</span>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FF6B4A]/10 text-[#FF6B4A]">
            <CompanionIcon className="w-3.5 h-3.5" />
            <span>{companion.label}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFB84D]/20 text-[#252525]">
            <DiningIcon className="w-3.5 h-3.5" />
            <span>{dining.label}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-[#252525]">
            <MapPin className="w-3.5 h-3.5 text-[#FF6B4A]" />
            <span className="max-w-[180px] truncate">{preferences.location?.address || 'Vị trí đã chọn'}</span>
            <span className="font-bold">({preferences.radiusKm} km)</span>
          </div>
        </div>

        <Link to="/">
          <Button variant="secondary" size="sm">
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
            Sửa bộ lọc
          </Button>
        </Link>
      </div>

      {/* View Switcher: Danh sách / Bản đồ */}
      <div className="flex items-center justify-between border-b border-[#EAE5DF] pb-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'list'
                ? 'bg-[#FF6B4A] text-white shadow-xs'
                : 'bg-white text-[#252525] hover:bg-neutral-100 border border-[#EAE5DF]'
            }`}
          >
            Chế độ danh sách
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
              activeTab === 'map'
                ? 'bg-[#FF6B4A] text-white shadow-xs'
                : 'bg-white text-[#252525] hover:bg-neutral-100 border border-[#EAE5DF]'
            }`}
          >
            Chế độ bản đồ
          </button>
        </div>

        <div className="text-xs text-[#6B6B6B]">
          Đang chuẩn bị kết nối dữ liệu ở Phase 7 (Backend API)
        </div>
      </div>

      {/* Content Area */}
      {activeTab === 'list' ? (
        <EmptyState
          title="Chưa kết nối API quán ăn"
          description="Bạn đã hoàn thành việc lựa chọn tiêu chí (Wizard 3 bước). Danh sách quán ăn thật từ Neon DB và Hybrid Places sẽ hiển thị tại đây sau khi thiết lập Backend Express & Database ở Phase 5-7."
          actionLabel="Quay lại tùy chỉnh bộ lọc"
          onAction={() => navigate('/')}
        />
      ) : (
        <div className="h-96 bg-white border border-[#EAE5DF] rounded-2xl flex flex-col items-center justify-center p-6 text-center text-[#6B6B6B]">
          <MapPin className="w-10 h-10 text-[#FF6B4A] mb-3 opacity-60" />
          <h3 className="font-bold text-base text-[#252525] mb-1">Bản đồ địa điểm</h3>
          <p className="text-sm max-w-sm">
            Bản đồ Hybrid (Leaflet cho quán nội bộ & Google Map cho Google Places) sẽ được tích hợp ở Phase 13.
          </p>
        </div>
      )}
    </Container>
  );
}
