import React from 'react';
import RestaurantCard from './RestaurantCard';
import Skeleton from '../common/Skeleton';
import EmptyState from '../common/EmptyState';
import ErrorState from '../common/ErrorState';

export default function RestaurantList({
  restaurants = [],
  loading = false,
  error = null,
  onRetry,
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-[#EAE5DF] p-0 overflow-hidden">
            <Skeleton className="aspect-[4/3] w-full rounded-none" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2 pt-2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Không thể tải danh sách quán"
        message={error}
        onRetry={onRetry}
      />
    );
  }

  if (!restaurants || restaurants.length === 0) {
    return (
      <EmptyState
        title="Không tìm thấy quán nào"
        description="Hiện chưa có quán ăn nào phù hợp với bộ lọc bạn đã chọn. Hãy thử nới rộng tiêu chí hoặc chọn khu vực khác."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {restaurants.map((restaurant) => (
        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
      ))}
    </div>
  );
}
