import React from 'react';

export default function Card({ children, className = '', hoverable = true, ...props }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-[#EAE5DF] p-5 shadow-[0_6px_24px_rgba(37,37,37,0.06)] transition-all ${
        hoverable ? 'hover:border-[#FF6B4A]/40 hover:shadow-[0_8px_30px_rgba(255,107,74,0.12)]' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
