import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

export default function RestaurantMap({ center, restaurants = [], selectedId, onSelectRestaurant }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  const userLat = center?.lat || 21.0285;
  const userLng = center?.lng || 105.8542;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLat, userLng],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update center and markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Center map
    map.setView([userLat, userLng], 13);

    // Clear previous markers
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
    }

    // 1. User Center Pin
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div style="
          width: 28px;
          height: 28px;
          background-color: #252525;
          color: white;
          border: 3px solid #FFF;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 11px;
        ">
          📍
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    L.marker([userLat, userLng], { icon: userIcon, zIndexOffset: 1000 })
      .bindPopup(
        `<div style="font-family: inherit; font-size: 13px; text-align: center; padding: 4px;">
          <strong>Vị trí đã chọn</strong><br/>
          <span style="color: #6B6B6B; font-size: 11px;">Điểm trung tâm khu vực</span>
        </div>`
      )
      .addTo(markersLayerRef.current);

    // 2. Restaurant Markers
    restaurants.forEach((r) => {
      const lat = r.location?.lat;
      const lng = r.location?.lng;
      if (!lat || !lng) return;

      const isSelected = selectedId === r.id;
      const markerColor = isSelected ? '#252525' : '#FF6B4A';

      const restaurantIcon = L.divIcon({
        className: 'custom-restaurant-marker',
        html: `
          <div style="
            width: ${isSelected ? '36px' : '30px'};
            height: ${isSelected ? '36px' : '30px'};
            background-color: ${markerColor};
            color: white;
            border: 2px solid #FFF;
            border-radius: 50%;
            box-shadow: 0 4px 10px rgba(0,0,0,0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${isSelected ? '16px' : '13px'};
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            🍜
          </div>
        `,
        iconSize: [isSelected ? 36 : 30, isSelected ? 36 : 30],
        iconAnchor: [isSelected ? 18 : 15, isSelected ? 18 : 15],
      });

      const popupContent = `
        <div style="font-family: inherit; font-size: 13px; max-width: 220px; line-height: 1.4;">
          <strong style="color: #252525; font-size: 14px; display: block; margin-bottom: 2px;">${r.name}</strong>
          <p style="color: #6B6B6B; font-size: 12px; margin: 0 0 6px 0;">${r.address || ''}</p>
          ${r.distanceKm !== null ? `<p style="color: #FF6B4A; font-weight: 600; font-size: 11px; margin-bottom: 6px;">Khoảng cách ~ ${r.distanceKm} km</p>` : ''}
          <div style="display: flex; gap: 6px; margin-top: 8px;">
            <a href="/restaurants/${r.id}" style="
              background-color: #FF6B4A;
              color: white;
              padding: 4px 10px;
              border-radius: 6px;
              text-decoration: none;
              font-size: 11px;
              font-weight: 600;
            ">Xem chi tiết</a>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank" rel="noopener noreferrer" style="
              background-color: #F3F3F3;
              color: #252525;
              padding: 4px 10px;
              border-radius: 6px;
              text-decoration: none;
              font-size: 11px;
              font-weight: 600;
            ">Chỉ đường</a>
          </div>
        </div>
      `;

      const marker = L.marker([lat, lng], { icon: restaurantIcon })
        .bindPopup(popupContent)
        .addTo(markersLayerRef.current);

      marker.on('click', () => {
        if (onSelectRestaurant) onSelectRestaurant(r.id);
      });
    });
  }, [userLat, userLng, restaurants, selectedId]);

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-[#EAE5DF] shadow-xs">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      
      {/* Map floating overlay info */}
      <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-[#EAE5DF] shadow-sm text-xs font-medium text-[#252525] flex items-center gap-2">
        <MapPin className="w-3.5 h-3.5 text-[#FF6B4A]" />
        <span>Khu vực tìm kiếm</span>
        <span className="text-[#6B6B6B]">({restaurants.length} quán quanh đây)</span>
      </div>

      <div className="absolute bottom-3 left-3 z-[400] bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-[#EAE5DF] text-[11px] text-[#6B6B6B]">
        Dữ liệu bản đồ &copy; OpenStreetMap
      </div>
    </div>
  );
}
