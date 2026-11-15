import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import Button from './Button';
import { fetchApi } from '../../utils/api';

const HANOI_DISTRICT_PRESETS = [
  { name: 'Hoàn Kiếm', lat: 21.0285, lng: 105.8544 },
  { name: 'Ba Đình', lat: 21.0341, lng: 105.8286 },
  { name: 'Đống Đa', lat: 21.0185, lng: 105.8236 },
  { name: 'Cầu Giấy', lat: 21.0362, lng: 105.7906 },
  { name: 'Tây Hồ', lat: 21.0583, lng: 105.8194 },
  { name: 'Hai Bà Trưng', lat: 21.0089, lng: 105.8524 },
  { name: 'Thanh Xuân', lat: 20.9937, lng: 105.8105 },
  { name: 'Nam Từ Liêm', lat: 21.0175, lng: 105.7725 },
  { name: 'Hà Đông', lat: 20.9721, lng: 105.7766 },
];

export default function MapLocationPicker({
  lat,
  lng,
  onChange,
  height = '300px',
  showSearch = true,
  showPresets = true,
  showGpsButton = true,
  showCoordsBadge = true,
  defaultAddress = '',
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [currentLat, setCurrentLat] = useState(lat ? Number(lat) : 21.0285);
  const [currentLng, setCurrentLng] = useState(lng ? Number(lng) : 105.8544);
  const [searchQuery, setSearchQuery] = useState(defaultAddress);
  const [searchLoading, setSearchLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsMessage, setGpsMessage] = useState(null);

  // Custom marker pin icon
  const createPinIcon = () => {
    return L.divIcon({
      className: 'custom-picker-pin',
      html: `
        <div style="
          width: 32px;
          height: 32px;
          background-color: #FF6B4A;
          color: white;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        ">
          📍
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = lat ? Number(lat) : 21.0285;
      const initialLng = lng ? Number(lng) : 105.8544;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Marker
      const marker = L.marker([initialLat, initialLng], {
        icon: createPinIcon(),
        draggable: true,
      }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        handleUpdateCoords(pos.lat, pos.lng);
      });

      // Click on map to move marker
      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        handleUpdateCoords(e.latlng.lat, e.latlng.lng);
      });

      markerRef.current = marker;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync external lat/lng changes
  useEffect(() => {
    if (lat && lng && mapInstanceRef.current && markerRef.current) {
      const numLat = Number(lat);
      const numLng = Number(lng);
      if (!isNaN(numLat) && !isNaN(numLng)) {
        setCurrentLat(numLat);
        setCurrentLng(numLng);
        markerRef.current.setLatLng([numLat, numLng]);
        mapInstanceRef.current.setView([numLat, numLng]);
      }
    }
  }, [lat, lng]);

  const handleUpdateCoords = (newLat, newLng, addressText) => {
    const fixedLat = Number(newLat.toFixed(6));
    const fixedLng = Number(newLng.toFixed(6));
    setCurrentLat(fixedLat);
    setCurrentLng(fixedLng);

    if (onChange) {
      onChange({
        lat: fixedLat,
        lng: fixedLng,
        address: addressText || searchQuery || `Tọa độ ${fixedLat}, ${fixedLng}`,
      });
    }
  };

  // Robust GPS Geolocation (supports PC Wi-Fi fallback)
  const handleGetGps = () => {
    if (!navigator.geolocation) {
      setGpsMessage({ type: 'error', text: 'Trình duyệt không hỗ trợ Geolocation. Hãy bấm trực tiếp trên bản đồ để chọn điểm!' });
      return;
    }

    setGpsLoading(true);
    setGpsMessage(null);

    // Step 1: try normal mode (enableHighAccuracy: false) which works best on PC / Wi-Fi
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        applyGpsCoords(pos.coords.latitude, pos.coords.longitude);
      },
      (err1) => {
        // Step 2: retry with high accuracy if first attempt failed
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            applyGpsCoords(pos.coords.latitude, pos.coords.longitude);
          },
          (err2) => {
            setGpsLoading(false);
            let msg = 'Không thể lấy GPS (trình duyệt hoặc thiết bị chưa bật định vị). Hãy bấm trực tiếp trên bản đồ bên dưới để chọn vị trí!';
            if (err2.code === 1) {
              msg = 'Trình duyệt đang chặn quyền vị trí. Bạn hãy bấm trực tiếp vào bản đồ để chọn tọa độ quán!';
            }
            setGpsMessage({ type: 'error', text: msg });
          },
          { enableHighAccuracy: true, timeout: 7000 }
        );
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  };

  const applyGpsCoords = (gpsLat, gpsLng) => {
    setGpsLoading(false);
    setGpsMessage({ type: 'success', text: 'Đã lấy tọa độ vị trí của bạn thành công!' });

    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([gpsLat, gpsLng]);
      mapInstanceRef.current.setView([gpsLat, gpsLng], 15);
    }
    handleUpdateCoords(gpsLat, gpsLng, 'Vị trí hiện tại của bạn (GPS)');
  };

  // Search Address via Backend Geocode (Robust, no CORS issues, instant dictionary fallback)
  const handleSearchAddress = async (e) => {
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }
    if (!searchQuery || !searchQuery.trim()) return;

    try {
      setSearchLoading(true);
      setGpsMessage(null);

      const query = searchQuery.trim();
      const res = await fetchApi(`/geocode?q=${encodeURIComponent(query)}`);

      if (res && res.data) {
        const foundLat = Number(res.data.lat);
        const foundLng = Number(res.data.lng);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([foundLat, foundLng], 15);
        }
        if (markerRef.current) {
          markerRef.current.setLatLng([foundLat, foundLng]);
        }
        handleUpdateCoords(foundLat, foundLng, res.data.displayName || query);
        setGpsMessage({ type: 'success', text: `Đã ghim vị trí: ${res.data.displayName || query}` });
      } else {
        setGpsMessage({ type: 'error', text: `Không tìm thấy vị trí "${query}". Bạn hãy chọn quận bên dưới hoặc bấm trực tiếp trên bản đồ!` });
      }
    } catch (err) {
      // Local fallback to presets in case backend geocode returns 404
      const normQ = searchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const match = HANOI_DISTRICT_PRESETS.find((p) => {
        const normP = p.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return normQ.includes(normP) || normP.includes(normQ);
      });

      if (match) {
        handleSelectPreset(match);
        setGpsMessage({ type: 'success', text: `Đã ghim vị trí khu vực: ${match.name}` });
      } else {
        setGpsMessage({
          type: 'error',
          text: `Không tìm thấy vị trí "${searchQuery.trim()}". Bạn hãy chọn quận bên dưới hoặc bấm trực tiếp trên bản đồ!`,
        });
      }
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectPreset = (p) => {
    setGpsMessage(null);
    setSearchQuery(p.name);
    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([p.lat, p.lng]);
      mapInstanceRef.current.setView([p.lat, p.lng], 14);
    }
    handleUpdateCoords(p.lat, p.lng, `Khu vực ${p.name}, Hà Nội`);
  };

  return (
    <div className="space-y-3">
      {/* Top Controls: Search address or GPS button */}
      {(showSearch || showGpsButton) && (
        <div className="flex flex-col sm:flex-row gap-2">
          {showSearch && (
            <div className="flex-1 flex gap-1.5">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Nhập tên đường, địa chỉ hoặc phố (ví dụ: Bát Đàn, Cầu Giấy)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSearchAddress(e);
                    }
                  }}
                  className="w-full text-xs py-2 pl-8 pr-3 rounded-xl border border-[#EAE5DF] bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]"
                />
                <Search className="w-3.5 h-3.5 text-[#6B6B6B] absolute left-2.5 top-2.5" />
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleSearchAddress}
                disabled={searchLoading}
                className="text-xs shrink-0 cursor-pointer"
              >
                {searchLoading ? 'Đang tìm...' : 'Tìm vị trí'}
              </Button>
            </div>
          )}

          {showGpsButton && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleGetGps}
              disabled={gpsLoading}
              className="text-xs shrink-0"
            >
              <Navigation className={`w-3.5 h-3.5 mr-1 ${gpsLoading ? 'animate-spin' : ''}`} />
              {gpsLoading ? 'Đang định vị...' : 'Vị trí hiện tại'}
            </Button>
          )}
        </div>
      )}

      {/* Quick district buttons for Hanoi */}
      {showPresets && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-semibold text-[#6B6B6B]">Chọn nhanh quận:</span>
          {HANOI_DISTRICT_PRESETS.map((p) => {
            const isSelected = Math.abs(currentLat - p.lat) < 0.01 && Math.abs(currentLng - p.lng) < 0.01;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#FF6B4A] bg-[#FF6B4A] text-white font-semibold shadow-xs'
                    : 'border-[#EAE5DF] bg-white text-[#252525] hover:bg-neutral-50'
                }`}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      )}

      {/* GPS/Search feedback message */}
      {gpsMessage && (
        <div
          className={`p-2.5 rounded-xl text-xs flex items-center justify-between gap-2 ${
            gpsMessage.type === 'success'
              ? 'bg-green-50 text-[#27865A] border border-green-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {gpsMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{gpsMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setGpsMessage(null)}
            className="text-neutral-400 hover:text-neutral-700 text-xs font-bold px-1.5 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Interactive Map Box */}
      <div className="relative rounded-2xl overflow-hidden border border-[#EAE5DF] shadow-xs">
        <div ref={mapContainerRef} style={{ height }} className="w-full z-0" />

        {/* Floating helper hint */}
        <div className="absolute top-2 left-2 z-[400] bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-[#EAE5DF] text-[11px] font-medium text-[#252525] shadow-xs pointer-events-none">
          👉 <strong>Bấm trực tiếp vào bản đồ</strong> để chọn vị trí
        </div>

        {/* Current coordinates display badge */}
        {showCoordsBadge && (
          <div className="absolute bottom-2 left-2 z-[400] bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-[#EAE5DF] text-xs font-mono font-semibold text-[#252525] shadow-xs flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#FF6B4A]" />
            <span>{currentLat.toFixed(4)}, {currentLng.toFixed(4)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
