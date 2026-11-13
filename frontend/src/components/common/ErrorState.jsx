import React from 'react';
import { AlertCircle } from 'lucide-react';
import Button from './Button';

export default function ErrorState({
  title = 'Đã có lỗi xảy ra',
  message = 'Không thể tải được dữ liệu vào lúc này. Vui lòng kiểm tra lại kết nối và thử lại.',
  onRetry,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 bg-white border border-[#C73535]/20 rounded-2xl ${className}`} role="alert">
      <div className="w-14 h-14 rounded-2xl bg-[#C73535]/10 text-[#C73535] flex items-center justify-center mb-4">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-[#252525] mb-2">{title}</h3>
      <p className="text-sm text-[#6B6B6B] max-w-md mb-6">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Thử lại
        </Button>
      )}
    </div>
  );
}
