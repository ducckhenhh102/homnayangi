import React from 'react';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[#EAE5DF] bg-white py-8 text-center text-sm text-[#6B6B6B]">
      <div className="max-w-6xl mx-auto px-4">
        <p className="flex items-center justify-center gap-1.5 font-medium">
          <span>Hôm Nay Ăn Gì?</span>
          <span>•</span>
          <span>Đề xuất ẩm thực thông minh theo bán kính 10 km</span>
        </p>
        <p className="mt-2 text-xs text-[#6B6B6B]/80 flex items-center justify-center gap-1">
          Thiết kế với <Heart className="w-3.5 h-3.5 text-[#FF6B4A] fill-[#FF6B4A]" /> phong cách Foodie Adventure
        </p>
      </div>
    </footer>
  );
}
