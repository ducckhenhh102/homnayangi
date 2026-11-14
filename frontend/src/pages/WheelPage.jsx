import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/common/Container';
import PageTitle from '../components/common/PageTitle';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import { useDiscovery } from '../context/DiscoveryContext';
import { fetchApi } from '../utils/api';
import { Disc3, ArrowLeft, Utensils, MapPin, Tag, RefreshCw, Navigation, Sparkles } from 'lucide-react';

const COLORS = ['#FF6B4A', '#FFB84D', '#27865A', '#4A90E2', '#9B51E0', '#F2994A', '#EB5757', '#6FCF97'];

export default function WheelPage() {
  const { preferences } = useDiscovery();
  const [mode, setMode] = useState('restaurant'); // 'restaurant' | 'food'
  const [candidates, setCandidates] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const [emptyState, setEmptyState] = useState(false);

  // Fetch candidate list for drawing segments on wheel
  const loadCandidates = async () => {
    try {
      setLoadingCandidates(true);
      setEmptyState(false);
      setSelectedResult(null);

      const params = new URLSearchParams({
        lat: String(preferences.location?.lat || 21.0285),
        lng: String(preferences.location?.lng || 105.8542),
        radiusKm: String(preferences.radiusKm || 10),
        diningType: preferences.diningType,
        companion: preferences.companion,
        limit: '20',
      });

      const res = await fetchApi(`/restaurants/nearby?${params.toString()}`);
      const restaurants = res.data || [];

      if (restaurants.length === 0) {
        setEmptyState(true);
        setCandidates([]);
        return;
      }

      if (mode === 'restaurant') {
        setCandidates(restaurants.map((r) => ({ id: r.id, name: r.name, raw: r })));
      } else {
        // Collect foods
        const foodMap = new Map();
        for (const r of restaurants) {
          for (const f of r.foods || []) {
            if (!foodMap.has(f.name)) {
              foodMap.set(f.name, { id: f.id, name: f.name, category: f.category, restaurant: r });
            }
          }
        }
        const foodList = Array.from(foodMap.values());
        if (foodList.length === 0) {
          setEmptyState(true);
          setCandidates([]);
        } else {
          setCandidates(foodList);
        }
      }
    } catch (err) {
      console.error('Lỗi tải ứng viên vòng quay:', err);
      setEmptyState(true);
    } finally {
      setLoadingCandidates(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, [mode, preferences.location?.lat, preferences.location?.lng, preferences.radiusKm, preferences.diningType]);

  const handleSpin = async () => {
    if (spinning || candidates.length === 0) return;

    try {
      setSpinning(true);
      setSelectedResult(null);

      // Call backend API for authorized, fair selection
      const res = await fetchApi('/wheel/spin', {
        method: 'POST',
        body: JSON.stringify({
          mode,
          filters: {
            lat: preferences.location?.lat || 21.0285,
            lng: preferences.location?.lng || 105.8542,
            radiusKm: preferences.radiusKm || 10,
            companion: preferences.companion,
            diningType: preferences.diningType,
          },
        }),
      });

      if (!res.data || res.meta?.reason === 'NO_CANDIDATES') {
        setEmptyState(true);
        setSpinning(false);
        return;
      }

      const winner = res.data.selected;

      // Find winner segment index
      let targetIndex = candidates.findIndex((c) =>
        mode === 'restaurant' ? c.id === winner.id || c.name === winner.name : c.name === winner.name
      );
      if (targetIndex === -1) targetIndex = 0;

      const numSegments = candidates.length;
      const segmentAngle = 360 / numSegments;
      // Target angle at the top pointer (90 deg or 270 deg depending on orientation)
      const targetDegree = 360 * 5 + (360 - targetIndex * segmentAngle - segmentAngle / 2);

      setRotation((prev) => prev + targetDegree);

      // Finish animation after 3.5s
      setTimeout(() => {
        setSelectedResult(winner);
        setSpinning(false);
      }, 3500);
    } catch (err) {
      alert(err.message || 'Lỗi khi quay vòng!');
      setSpinning(false);
    }
  };

  return (
    <Container className="max-w-4xl py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF6B4A] hover:underline mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Quay lại danh sách
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#252525]">
            Vòng quay ẩm thực
          </h1>
        </div>

        {/* Mode switcher tabs */}
        <div className="flex gap-1.5 p-1 bg-white border border-[#EAE5DF] rounded-2xl">
          <button
            type="button"
            onClick={() => setMode('restaurant')}
            disabled={spinning}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              mode === 'restaurant'
                ? 'bg-[#FF6B4A] text-white shadow-xs'
                : 'text-[#252525] hover:bg-neutral-100'
            }`}
          >
            Quay chọn quán
          </button>
          <button
            type="button"
            onClick={() => setMode('food')}
            disabled={spinning}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              mode === 'food'
                ? 'bg-[#FF6B4A] text-white shadow-xs'
                : 'text-[#252525] hover:bg-neutral-100'
            }`}
          >
            Quay chọn món
          </button>
        </div>
      </div>

      {emptyState ? (
        <EmptyState
          title="Không có ứng viên nào trong bán kính"
          description={`Không tìm thấy ${mode === 'restaurant' ? 'quán ăn' : 'món ăn'} nào thỏa mãn bộ lọc trong phạm vi ${preferences.radiusKm} km của bạn.`}
          actionLabel="Tùy chỉnh lại bộ lọc"
          onAction={() => window.location.href = '/'}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Wheel Canvas Section */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-[#EAE5DF] shadow-sm">
            <div className="relative w-72 h-72 sm:w-84 sm:h-84 flex items-center justify-center my-4">
              {/* Top pointer marker */}
              <div className="absolute -top-3 z-20 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[22px] border-t-[#C73535] drop-shadow-md" />

              {/* Wheel SVG */}
              <div
                className="w-full h-full rounded-full border-4 border-white shadow-lg overflow-hidden transition-transform duration-[3500ms] ease-out"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {candidates.map((cand, i) => {
                    const total = candidates.length;
                    const angle = 360 / total;
                    const startAngle = i * angle;
                    const endAngle = (i + 1) * angle;

                    const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                    const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                    const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                    const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

                    const d = `M 50 50 L ${x1} ${y1} A 50 50 0 ${angle > 180 ? 1 : 0} 1 ${x2} ${y2} Z`;

                    return (
                      <g key={cand.id || i}>
                        <path d={d} fill={COLORS[i % COLORS.length]} />
                        <text
                          x="70"
                          y="51"
                          fill="white"
                          fontSize="3.5"
                          fontWeight="bold"
                          textAnchor="middle"
                          transform={`rotate(${startAngle + angle / 2}, 50, 50)`}
                        >
                          {cand.name.length > 12 ? `${cand.name.slice(0, 10)}..` : cand.name}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Center knob */}
              <div className="absolute z-10 w-12 h-12 rounded-full bg-white border-4 border-[#FF6B4A] shadow-md flex items-center justify-center font-black text-xs text-[#FF6B4A]">
                ĂN GÌ
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={handleSpin}
              isLoading={spinning || loadingCandidates}
              disabled={candidates.length === 0}
              className="mt-4 px-8 font-bold text-lg shadow-md"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {spinning ? 'Đang quay...' : 'Quay ngẫu nhiên ngay!'}
            </Button>
          </div>

          {/* Result Section */}
          <div className="lg:col-span-5 space-y-4">
            {selectedResult ? (
              <div className="bg-[#FFF9F2] rounded-3xl p-6 sm:p-7 border-2 border-[#FF6B4A] shadow-[0_8px_30px_rgba(255,107,74,0.15)] space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-xs font-bold text-[#FF6B4A] uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Kết quả gợi ý hôm nay!</span>
                </div>

                <h2 className="text-2xl font-black text-[#252525]">
                  {selectedResult.name}
                </h2>

                {mode === 'restaurant' ? (
                  <>
                    <div className="flex items-start gap-1.5 text-xs text-[#6B6B6B]">
                      <MapPin className="w-4 h-4 shrink-0 text-[#FF6B4A] mt-0.5" />
                      <span>{selectedResult.address}</span>
                    </div>

                    {selectedResult.distanceKm !== null && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white text-[#27865A] border border-[#EAE5DF]">
                        Cách bạn {selectedResult.distanceKm} km
                      </div>
                    )}

                    <div className="pt-3 border-t border-[#EAE5DF] flex items-center gap-2">
                      <Link to={`/restaurants/${selectedResult.slug || selectedResult.id}`} className="flex-1">
                        <Button variant="primary" size="md" className="w-full">
                          Xem chi tiết quán
                        </Button>
                      </Link>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${selectedResult.location?.lat},${selectedResult.location?.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="secondary" size="md">
                          <Navigation className="w-4 h-4" />
                        </Button>
                      </a>
                    </div>
                  </>
                ) : (
                  <>
                    {selectedResult.category && (
                      <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#FFB84D]/20 text-[#966417]">
                        {selectedResult.category}
                      </span>
                    )}

                    <div className="space-y-2 pt-2 border-t border-[#EAE5DF]">
                      <span className="text-xs font-semibold text-[#6B6B6B]">Quán bán món này quanh bạn:</span>
                      {selectedResult.availableAt?.map((shop) => (
                        <div key={shop.id} className="p-3 bg-white rounded-xl border border-[#EAE5DF] flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-[#252525]">{shop.name}</div>
                            <div className="text-[11px] text-[#6B6B6B]">{shop.address}</div>
                          </div>
                          {shop.priceVnd && (
                            <span className="font-bold text-[#FF6B4A]">{shop.priceVnd.toLocaleString('vi-VN')}đ</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="p-6 bg-white rounded-3xl border border-[#EAE5DF] text-center text-[#6B6B6B] space-y-2">
                <Disc3 className="w-10 h-10 text-[#FF6B4A]/50 mx-auto mb-2" />
                <h3 className="font-bold text-base text-[#252525]">Sẵn sàng quay</h3>
                <p className="text-xs leading-relaxed">
                  Hệ thống đang có <span className="font-bold text-[#FF6B4A]">{candidates.length}</span> ứng viên phù hợp với tiêu chí của bạn. Bấm nút Quay ngẫu nhiên để chọn ngay!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </Container>
  );
}
