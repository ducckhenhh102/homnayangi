import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[44px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-[#FF6B4A] hover:bg-[#E85A3A] text-white focus:ring-[#FF6B4A] shadow-sm',
    secondary: 'bg-white hover:bg-neutral-50 text-[#252525] border border-[#EAE5DF] focus:ring-[#FF6B4A] shadow-sm',
    accent: 'bg-[#FFB84D] hover:bg-[#e5a43f] text-[#252525] focus:ring-[#FFB84D] shadow-sm',
    ghost: 'bg-transparent hover:bg-neutral-100 text-[#252525] focus:ring-[#FF6B4A]',
    danger: 'bg-[#C73535] hover:bg-[#a82a2a] text-white focus:ring-[#C73535] shadow-sm',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3 text-lg font-semibold',
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span>Đang xử lý...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
