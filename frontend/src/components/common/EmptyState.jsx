import React from 'react';
import { SearchX } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon: Icon = SearchX,
  title = 'Chưa tìm thấy quán ăn phù hợp',
  description = 'Hãy thử chọn khu vực khác hoặc thay đổi kiểu món ăn.',
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 bg-white border border-[#EAE5DF] rounded-2xl shadow-sm ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-[#FFF9F2] text-[#FF6B4A] flex items-center justify-center mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-[#252525] mb-2">{title}</h3>
      <p className="text-sm text-[#6B6B6B] max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
