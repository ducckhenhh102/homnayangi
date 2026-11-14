import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[#EAE5DF] bg-white py-5 text-center text-sm text-[#6B6B6B]">
      <div className="max-w-6xl mx-auto px-4">
        <p className="flex items-center justify-center gap-1.5 font-medium">
          <span>© {new Date().getFullYear()} Hôm Nay Ăn Gì?</span>
          <span>•</span>
          <span>Made with ❤️ in Hà Nội</span>
        </p>
      </div>
    </footer>
  );
}
