import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDiscovery } from '../../context/DiscoveryContext';
import DiningTypePicker from './DiningTypePicker';
import LocationPicker from './LocationPicker';
import Button from '../common/Button';
import { Compass, Disc3 } from 'lucide-react';

export default function DiscoveryWizard() {
  const navigate = useNavigate();
  const { preferences, setDiningType, setRadiusKm, setLocation } = useDiscovery();

  const isLocationValid = Boolean(preferences.location?.lat && preferences.location?.lng);

  const handleExplore = () => {
    if (!isLocationValid) return;
    navigate('/explore');
  };

  const handleWheel = () => {
    if (!isLocationValid) return;
    navigate('/wheel');
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE5DF] shadow-[0_6px_24px_rgba(37,37,37,0.06)] space-y-8 max-w-3xl mx-auto">
      {/* Bước 1: Nhu cầu ăn uống */}
      <DiningTypePicker
        value={preferences.diningType}
        onChange={setDiningType}
      />

      <div className="border-t border-[#EAE5DF]" />

      {/* Bước 2: Vị trí & Bán kính */}
      <LocationPicker
        location={preferences.location}
        onLocationChange={setLocation}
        radiusKm={preferences.radiusKm}
        onRadiusChange={setRadiusKm}
      />

      <div className="border-t border-[#EAE5DF]" />

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <Button
          size="lg"
          variant="primary"
          onClick={handleExplore}
          disabled={!isLocationValid}
          className="w-full sm:flex-1"
        >
          <Compass className="w-5 h-5 mr-2" />
          Khám phá danh sách quán
        </Button>

        <Button
          size="lg"
          variant="accent"
          onClick={handleWheel}
          disabled={!isLocationValid}
          className="w-full sm:w-auto"
        >
          <Disc3 className="w-5 h-5 mr-2" />
          Để vòng quay chọn giúp
        </Button>
      </div>
    </div>
  );
}
