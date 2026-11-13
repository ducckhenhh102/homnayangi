import React from 'react';
import Container from '../components/common/Container';
import PageTitle from '../components/common/PageTitle';

export default function ExplorePage() {
  return (
    <Container>
      <PageTitle
        title="Khám phá quán ăn"
        subtitle="Danh sách các địa điểm phù hợp với lựa chọn của bạn trong bán kính 10 km"
      />
      <div className="bg-white rounded-2xl p-8 border border-[#EAE5DF] text-center text-[#6B6B6B]">
        Trang khám phá đang được xây dựng theo lộ trình Phase 4 & Phase 7.
      </div>
    </Container>
  );
}
