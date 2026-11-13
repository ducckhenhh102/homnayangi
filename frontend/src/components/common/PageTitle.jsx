import React from 'react';

export default function PageTitle({ title, subtitle, className = '' }) {
  return (
    <div className={`mb-6 sm:mb-8 text-center ${className}`}>
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#252525] tracking-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-sm sm:text-base text-[#6B6B6B] max-w-xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}
