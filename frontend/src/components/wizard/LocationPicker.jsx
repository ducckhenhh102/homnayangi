import React, { useState } from 'react';
import { MapPin, Navigation, AlertCircle, CheckCircle2 } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';

const PRESET_LOCATIONS = [
  { name: 'Hà Nội - Hoàn Kiếm', lat: 21.028511, lng: 105.854444 },
  { name: 'Hà Nội - Cầu Giấy', lat: 21.036237, lng: 105.790583 },
  { name: 'TP.HCM - Quận 1', lat: 10.776889, lng: 106.700806 },
  { name: 'TP.HCM - Bình Thạnh', lat: 10.810583, lng: 106.699111 },
  { name: 'Đà Nẵng - Hải Châu', lat: 16.054407, lng: 108.202167 },
];

export default function LocationPicker({ location, onLocationChange, radiusKm, onRadiusChange }) {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [manualQuery, setManualQuery] = useState(location?.address || '');

  const handleGetGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Trình duyệt của bạn không hỗ trợ định vị GPS.');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        const { latitude, longitude } = pos.coords;
        onLocationChange({
          type: 'gps',
          lat: latitude,
          lng: longitude,
          address: 'Vị trí hiện tại của bạn (GPS)',
        });
      },
      (err) => {
        setGpsLoading(false);
        let msg = 'Không thể lấy vị trí GPS.';
        if (err.code === 1) {
          msg = 'Bạn đã từ chối cấp quyền GPS. Vui lòng chọn địa điểm thủ công bên dưới.';
        } else if (err.code === 2) {
          msg = 'Vị trí hiện không khả dụng. Vui lòng thử lại hoặc chọn thủ công.';
        } else if (err.code === 3) {
          msg = 'Quá thời gian yêu cầu vị trí. Vui lòng thử lại.';
        }
        setGpsError(msg);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSelectPreset = (preset) => {
    setGpsError(null);
    setManualQuery(preset.name);
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
        Bước 3: Vị trí & Bán kính tìm kiếm (Tối đa 10 km)
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
              {location?.type === 'gps' ? 'Đã định vị thành công' : 'Yêu cầu quyền truy cập vị trí'}
            </div>
          </div>
        </button>

        <div
          className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
            location?.type === 'manual'
              ? 'border-[#FF6B4A] bg-[#FF6B4A]/5 ring-1 ring-[#FF6B4A]'
              : 'border-[#EAE5DF] bg-white'
          }`}
        >
          <div className="w-9 h-9 rounded-lg bg-neutral-100 text-[#252525] flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-sm text-[#252525]">Chọn thủ công</div>
            <div className="text-xs text-[#6B6B6B]">Nhập tên khu vực hoặc chọn gợi ý</div>
          </div>
        </div>
      </div>

      {/* GPS Error alert */}
      {gpsError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-[#C73535] flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* Manual presets */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-[#6B6B6B]">Khu vực gợi ý sẵn:</span>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_LOCATIONS.map((preset) => {
            const isSelected = location?.lat === preset.lat && location?.lng === preset.lng;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#FF6B4A] bg-[#FF6B4A] text-white font-medium shadow-xs'
                    : 'border-[#EAE5DF] bg-white text-[#252525] hover:bg-neutral-50'
                }`}
              >
                {preset.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current chosen location badge */}
      {location?.lat && (
        <div className="flex items-center gap-2 p-2.5 bg-neutral-50 border border-[#EAE5DF] rounded-xl text-xs text-[#252525]">
          <CheckCircle2 className="w-4 h-4 text-[#27865A] shrink-0" />
          <span className="font-medium">Vị trí đã chọn:</span>
          <span className="text-[#6B6B6B] truncate">{location.address || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}</span>
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
