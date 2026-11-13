import React from 'react';

export default function Skeleton({ className = '', variant = 'rectangular' }) {
  const variantStyles = {
    rectangular: 'rounded-xl',
    circular: 'rounded-full',
    text: 'rounded-md h-4',
  };

  return (
    <div
      className={`animate-pulse bg-[#EAE5DF]/70 ${variantStyles[variant] || variantStyles.rectangular} ${className}`}
      aria-hidden="true"
    />
  );
}
