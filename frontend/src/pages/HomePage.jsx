import React from 'react';
import Container from '../components/common/Container';
import Button from '../components/common/Button';
import { Compass, Disc3, Heart, Users, User, Coffee, UtensilsCrossed, Beer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <Container className="py-8 sm:py-12">
      {/* Hero Section */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FF6B4A]/10 text-[#FF6B4A] mb-4">
          ✨ Trợ thủ ẩm thực của bạn
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#252525] tracking-tight leading-tight">
          Hôm nay <span className="text-[#FF6B4A]">ăn gì?</span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-[#6B6B6B]">
          Đừng mất 30 phút nghĩ xem đi đâu. Chọn người đồng hành, phong cách ăn và khám phá quán ngon quanh bạn trong 10 km!
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            size="lg"
            variant="primary"
            onClick={() => navigate('/explore')}
            className="w-full sm:w-auto"
          >
            <Compass className="w-5 h-5 mr-2" />
            Khám phá quán gần bạn
          </Button>
          <Button
            size="lg"
            variant="accent"
            onClick={() => navigate('/wheel')}
            className="w-full sm:w-auto"
          >
            <Disc3 className="w-5 h-5 mr-2" />
            Quay vòng ngẫu nhiên
          </Button>
        </div>
      </div>

      {/* Feature preview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="p-6 bg-white rounded-2xl border border-[#EAE5DF] shadow-[0_6px_24px_rgba(37,37,37,0.05)]">
          <div className="w-12 h-12 rounded-xl bg-[#FF6B4A]/10 text-[#FF6B4A] flex items-center justify-center mb-4 font-bold text-xl">
            1
          </div>
          <h3 className="font-bold text-lg text-[#252525] mb-2">Đi cùng ai?</h3>
          <p className="text-sm text-[#6B6B6B]">
            Tự động gợi ý không gian phù hợp: lãng mạn cho người yêu, sôi động cho bạn bè hoặc yên tĩnh cho một mình.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-[#EAE5DF] shadow-[0_6px_24px_rgba(37,37,37,0.05)]">
          <div className="w-12 h-12 rounded-xl bg-[#FFB84D]/20 text-[#e5a43f] flex items-center justify-center mb-4 font-bold text-xl">
            2
          </div>
          <h3 className="font-bold text-lg text-[#252525] mb-2">Ăn kiểu gì?</h3>
          <p className="text-sm text-[#6B6B6B]">
            Từ ăn vặt trà sữa nhẹ nhàng, bữa ăn bình thường ấm cúng đến tụ tập lai rai đi nhậu thả ga.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-[#EAE5DF] shadow-[0_6px_24px_rgba(37,37,37,0.05)]">
          <div className="w-12 h-12 rounded-xl bg-[#27865A]/10 text-[#27865A] flex items-center justify-center mb-4 font-bold text-xl">
            3
          </div>
          <h3 className="font-bold text-lg text-[#252525] mb-2">Bán kính 10 km</h3>
          <p className="text-sm text-[#6B6B6B]">
            Tính toán khoảng cách chính xác theo GPS hoặc địa điểm bạn chọn. Không lo bị chỉ quán quá xa.
          </p>
        </div>
      </div>
    </Container>
  );
}
