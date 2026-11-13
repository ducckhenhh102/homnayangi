import React from 'react';
import Container from '../components/common/Container';
import PageTitle from '../components/common/PageTitle';

export default function WheelPage() {
  return (
    <Container>
      <PageTitle
        title="Vòng quay ẩm thực"
        subtitle="Quay ngẫu nhiên chọn món hoặc chọn quán từ các lựa chọn hợp lệ"
      />
      <div className="bg-white rounded-2xl p-8 border border-[#EAE5DF] text-center text-[#6B6B6B]">
        Trang vòng quay sẽ được hoàn thiện ở Phase 11.
      </div>
    </Container>
  );
}
