import React from 'react';
import Container from '../components/common/Container';
import DiscoveryWizard from '../components/wizard/DiscoveryWizard';

export default function HomePage() {
  return (
    <Container className="py-6 sm:py-10">
      {/* Hero Headline */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FF6B4A]/10 text-[#FF6B4A] mb-3">
          ✨ Trợ thủ ẩm thực thông minh
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#252525] tracking-tight leading-tight">
          Hôm nay <span className="text-[#FF6B4A]">ăn gì?</span>
        </h1>
        <p className="mt-3 text-sm sm:text-base text-[#6B6B6B]">
          Chọn kiểu ăn uống và khu vực — để chúng tôi gợi ý những quán ngon phù hợp nhất cho bạn.
        </p>
      </div>

      {/* Discovery Wizard */}
      <DiscoveryWizard />
    </Container>
  );
}
