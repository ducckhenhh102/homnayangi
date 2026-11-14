import React, { useState } from 'react';
import { MapPin, Navigation, AlertCircle, CheckCircle2, Compass } from 'lucide-react';
import MapLocationPicker from '../common/MapLocationPicker';

const PRESET_LOCATIONS = [
  { name: 'Hà Nội - Hoàn Kiếm', lat: 21.0285, lng: 105.8544 },
  { name: 'Hà Nội - Ba Đình', lat: 21.0341, lng: 105.8286 },
  { name: 'Hà Nội - Đống Đa', lat: 21.0185, lng: 105.8236 },
  { name: 'Hà Nội - Cầu Giấy', lat: 21.0362, lng: 105.7906 },
  { name: 'Hà Nội - Tây Hồ', lat: 21.0583, lng: 105.8194 },
  { name: 'Hà Nội - Hai Bà Trưng', lat: 21.0089, lng: 105.8524 },
  { name: 'Hà Nội - Thanh Xuân', lat: 20.9937, lng: 105.8105 },
  { name: 'Hà Nội - Nam Từ Liêm', lat: 21.0175, lng: 105.7725 },
  { name: 'Hà Nội - Hà Đông', lat: 20.9721, lng: 105.7766 },
];

export default function LocationPicker({ location, onLocationChange, radiusKm, onRadiusChange }) {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [showMapPicker, setShowMapPicker] = useState(false);

  const handleGetGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Trình duyệt của bạn không hỗ trợ định vị. Hãy bấm chọn trên bản đồ bên dưới!');
      setShowMapPicker(true);
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    // 1st attempt: Normal accuracy (Wi-Fi/IP - best for Windows PC)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        const { latitude, longitude } = pos.coords;
        onLocationChange({
          type: 'gps',
          lat: Number(latitude.toFixed(6)),
          lng: Number(longitude.toFixed(6)),
          address: 'Vị trí hiện tại của bạn (GPS)',
        });
      },
      (err1) => {
        // 2nd attempt: High accuracy fallback
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setGpsLoading(false);
            const { latitude, longitude } = pos.coords;
            onLocationChange({
              type: 'gps',
              lat: Number(latitude.toFixed(6)),
              lng: Number(longitude.toFixed(6)),
              address: 'Vị trí hiện tại của bạn (GPS)',
            });
          },
          (err2) => {
            setGpsLoading(false);
            let msg = 'Không thể lấy GPS (thiết bị chưa cấp quyền định vị). Hãy chọn quận hoặc bấm trên bản đồ bên dưới!';
            if (err2.code === 1) {
              msg = 'Trình duyệt đang chặn quyền vị trí. Bạn có thể chọn quận hoặc bấm trực tiếp trên bản đồ!';
            }
            setGpsError(msg);
            setShowMapPicker(true);
          },
          { enableHighAccuracy: true, timeout: 7000 }
        );
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  };

  const handleSelectPreset = (preset) => {
    setGpsError(null);
    onLocationChange({
      type: 'manual',
      lat: preset.lat,
      lng: preset.lng,
      address: preset.name,
    });
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-[#252525]">
        Bước 2: Vị trí & Bán kính tìm kiếm (Tối đa 10 km)
      </label>

      {/* Mode Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleGetGps}
          disabled={gpsLoading}
          className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF6B4A] ${
            location?.type === 'gps'
              ? 'border-[#FF6B4A] bg-[#FF6B4A]/5 ring-1 ring-[#FF6B4A]'
              : 'border-[#EAE5DF] bg-white hover:border-neutral-300'
          }`}
        >
          <div className="w-9 h-9 rounded-lg bg-[#FF6B4A]/10 text-[#FF6B4A] flex items-center justify-center shrink-0">
            <Navigation className={`w-4 h-4 ${gpsLoading ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className="font-semibold text-sm text-[#252525]">Dùng GPS hiện tại</div>
            <div className="text-xs text-[#6B6B6B]">
              {location?.type === 'gps' ? 'Đã định vị thành công' : 'Bấm để tự động định vị'}
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setShowMapPicker(!showMapPicker)}
          className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF6B4A] ${
            showMapPicker || location?.type === 'manual'
              ? 'border-[#FF6B4A] bg-[#FF6B4A]/5 ring-1 ring-[#FF6B4A]'
              : 'border-[#EAE5DF] bg-white hover:border-neutral-300'
          }`}
        >
          <div className="w-9 h-9 rounded-lg bg-neutral-100 text-[#252525] flex items-center justify-center shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-sm text-[#252525]">Chọn trên bản đồ</div>
            <div className="text-xs text-[#6B6B6B]">
              {showMapPicker ? 'Đang mở bản đồ' : 'Bấm để mở bản đồ chọn điểm'}
            </div>
          </div>
        </button>
      </div>

      {/* GPS Error alert */}
      {gpsError && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* Interactive Map Picker (when opened or when GPS fails) */}
      {showMapPicker && (
        <div className="p-3.5 bg-white border border-[#EAE5DF] rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#252525]">
            <span>BẢN ĐỒ CHỌN ĐIỂM TÙY Ý:</span>
            <span className="text-[#FF6B4A] font-normal text-[11px]">Bấm vào điểm bất kỳ để chọn</span>
          </div>
          <MapLocationPicker
            lat={location?.lat || 21.0285}
            lng={location?.lng || 105.8544}
            height="220px"
            showPresets={false}
            onChange={({ lat, lng, address }) => {
              onLocationChange({
                type: 'manual',
                lat,
                lng,
                address: address || `Tọa độ ${lat}, ${lng}`,
              });
            }}
          />
        </div>
      )}

      {/* Quick district buttons for Hanoi */}
      <div className="space-y-1.5">
        <span className="text-xs font-medium text-[#6B6B6B]">Chọn nhanh khu vực Hà Nội:</span>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_LOCATIONS.map((preset) => {
            const isSelected = location?.lat === preset.lat && location?.lng === preset.lng;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#FF6B4A] bg-[#FF6B4A] text-white font-medium shadow-xs'
                    : 'border-[#EAE5DF] bg-white text-[#252525] hover:bg-neutral-50'
                }`}
              >
                {preset.name.replace('Hà Nội - ', '')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current chosen location badge */}
      {location?.lat && (
        <div className="flex items-center gap-2 p-2.5 bg-neutral-50 border border-[#EAE5DF] rounded-xl text-xs text-[#252525]">
          <CheckCircle2 className="w-4 h-4 text-[#27865A] shrink-0" />
          <span className="font-medium">Vị trí tìm kiếm:</span>
          <span className="text-[#6B6B6B] truncate font-semibold">
            {location.address || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
          </span>
          <span className="text-xs font-mono text-[#FF6B4A] ml-auto">
            ({location.lat.toFixed(3)}, {location.lng.toFixed(3)})
          </span>
        </div>
      )}

      {/* Radius Slider (1..10 km strictly) */}
      <div className="p-4 bg-white border border-[#EAE5DF] rounded-xl space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-[#252525]">Bán kính tìm kiếm (Đường chim bay):</span>
          <span className="font-bold text-[#FF6B4A] text-base">{radiusKm} km</span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          step="1"
          value={radiusKm}
          onChange={(e) => onRadiusChange(Number(e.target.value))}
          className="w-full accent-[#FF6B4A] cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-[#6B6B6B]">
          <span>1 km (Gần ngay đây)</span>
          <span>5 km (Tiêu chuẩn)</span>
          <span>10 km (Tối đa)</span>
        </div>
      </div>
    </div>
  );
}
