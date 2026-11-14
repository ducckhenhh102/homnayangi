import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from '../components/common/Container';
import Button from '../components/common/Button';
import RestaurantList from '../components/restaurant/RestaurantList';
import RestaurantMap from '../components/map/RestaurantMap';
import { useDiscovery } from '../context/DiscoveryContext';
import { fetchApi } from '../utils/api';
import { Coffee, UtensilsCrossed, Beer, MapPin, Disc3, SlidersHorizontal, List, Map } from 'lucide-react';

const DINING_LABELS = {
  snack: { label: 'Ăn vặt', icon: Coffee },
  meal: { label: 'Ăn bình thường', icon: UtensilsCrossed },
  drinking: { label: 'Đi nhậu', icon: Beer },
};

export default function ExplorePage() {
  const navigate = useNavigate();
  const { preferences } = useDiscovery();
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'map'
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dining = DINING_LABELS[preferences.diningType] || DINING_LABELS.meal;
  const DiningIcon = dining.icon;

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        lat: String(preferences.location?.lat || 21.0285),
        lng: String(preferences.location?.lng || 105.8542),
        radiusKm: '10',
        diningType: preferences.diningType,
        limit: '20',
        sort: 'distance',
      });

      const response = await fetchApi(`/restaurants/nearby?${params.toString()}`);
      setRestaurants(response.data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách quán gần đây:', err);
      setError(err.message || 'Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, [
    preferences.location?.lat,
    preferences.location?.lng,
    preferences.diningType,
  ]);

  return (
    <Container className="space-y-5">
      {/* Compact top bar: filter chips + actions */}
      <div className="p-3.5 bg-white border border-[#EAE5DF] rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FFB84D]/20 text-[#252525]">
            <DiningIcon className="w-3.5 h-3.5" />
            <span>{dining.label}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-neutral-100 text-[#252525]">
            <MapPin className="w-3.5 h-3.5 text-[#FF6B4A]" />
            <span className="max-w-[220px] truncate font-medium">
              {preferences.location?.address || 'Khu vực đã chọn'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
              Đổi khu vực & món
            </Button>
          </Link>
          <Button
            variant="accent"
            size="sm"
            onClick={() => navigate('/wheel')}
          >
            <Disc3 className="w-3.5 h-3.5 mr-1.5" />
            Vòng quay
          </Button>
        </div>
      </div>

      {/* View Switcher + Results header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#252525]">
          Quán ngon khu vực này
        </h1>

        <div className="flex gap-1 p-1 bg-white border border-[#EAE5DF] rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'list'
                ? 'bg-[#FF6B4A] text-white shadow-xs'
                : 'text-[#252525] hover:bg-neutral-100'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Danh sách
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'map'
                ? 'bg-[#FF6B4A] text-white shadow-xs'
                : 'text-[#252525] hover:bg-neutral-100'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            Bản đồ
          </button>
        </div>
      </div>

      {/* Content Area */}
      {activeTab === 'list' ? (
        <RestaurantList
          restaurants={restaurants}
          loading={loading}
          error={error}
          onRetry={loadRestaurants}
        />
      ) : (
        <div className="space-y-3">
          <RestaurantMap
            center={preferences.location}
            restaurants={restaurants}
          />
          <div className="p-3 bg-white border border-[#EAE5DF] rounded-xl text-xs text-[#6B6B6B] flex items-center justify-between">
            <span>Bấm vào biểu tượng 🍜 trên bản đồ để xem thông tin quán và nút chỉ đường Google Maps.</span>
            <button
              onClick={() => setActiveTab('list')}
              className="text-[#FF6B4A] font-semibold hover:underline cursor-pointer"
            >
              Xem danh sách
            </button>
          </div>
        </div>
      )}
    </Container>
  );
}
