import React from 'react';
import { Coffee, UtensilsCrossed, Beer } from 'lucide-react';

const DINING_TYPES = [
  {
    id: 'snack',
    label: 'Ăn vặt',
    desc: 'Trà sữa, kem, bánh tráng, xiên que ăn nhẹ',
    icon: Coffee,
  },
  {
    id: 'meal',
    label: 'Ăn bình thường',
    desc: 'Bữa chính ấm bụng: cơm, bún, phở, lẩu, nướng',
    icon: UtensilsCrossed,
  },
  {
    id: 'drinking',
    label: 'Đi nhậu',
    desc: 'Lai rai tối muộn, mồi bén, tụ tập cụng ly',
    icon: Beer,
  },
];

export default function DiningTypePicker({ value, onChange }) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-[#252525]">
        Bước 2: Nhu cầu ăn uống của bạn là gì?
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="radiogroup" aria-label="Chọn phong cách ăn uống">
        {DINING_TYPES.map((item) => {
          const Icon = item.icon;
          const isSelected = value === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(item.id)}
              className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all cursor-pointer min-h-[110px] focus:outline-none focus:ring-2 focus:ring-[#FF6B4A] ${
                isSelected
                  ? 'border-[#FF6B4A] bg-[#FF6B4A]/5 shadow-sm ring-1 ring-[#FF6B4A]'
                  : 'border-[#EAE5DF] bg-white hover:border-neutral-300'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 transition-colors ${
                  isSelected ? 'bg-[#FF6B4A] text-white' : 'bg-neutral-100 text-[#252525]'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="font-bold text-[#252525] text-base">{item.label}</div>
              <div className="text-xs text-[#6B6B6B] mt-1 line-clamp-2">{item.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
