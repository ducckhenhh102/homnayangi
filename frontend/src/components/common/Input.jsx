import React from 'react';

export default function Input({
  label,
  error,
  helperText,
  id,
  className = '',
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[#252525] mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full min-h-[44px] px-3.5 py-2.5 bg-white border rounded-xl text-[#252525] placeholder:text-[#6B6B6B] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6B4A] focus:border-transparent ${
          error ? 'border-[#C73535] focus:ring-[#C73535]' : 'border-[#EAE5DF]'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-[#C73535]">{error}</p>}
      {!error && helperText && <p className="mt-1 text-xs text-[#6B6B6B]">{helperText}</p>}
    </div>
  );
}
