import React from 'react';
import { useParams } from 'react-router-dom';
import Container from '../components/common/Container';
import PageTitle from '../components/common/PageTitle';

export default function RestaurantDetailPage() {
  const { id } = useParams();

  return (
    <Container>
      <PageTitle
        title="Chi tiết quán ăn"
        subtitle={`Thông tin chi tiết của quán ID: ${id}`}
      />
      <div className="bg-white rounded-2xl p-8 border border-[#EAE5DF] text-center text-[#6B6B6B]">
        Chi tiết quán sẽ được tích hợp với dữ liệu API ở Phase 7.
      </div>
    </Container>
  );
}
