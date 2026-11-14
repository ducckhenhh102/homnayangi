import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Utensils, Compass, Disc3, Menu, X, PlusCircle } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Khám phá', path: '/explore', icon: Compass },
    { name: 'Vòng quay', path: '/wheel', icon: Disc3 },
    { name: 'Chia sẻ quán', path: '/submit-restaurant', icon: PlusCircle },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#EAE5DF]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 font-bold text-lg sm:text-xl text-[#FF6B4A]">
            <span className="p-2 bg-[#FF6B4A]/10 rounded-xl text-[#FF6B4A]">
              <Utensils className="w-5 h-5" />
            </span>
            <span className="text-[#252525] font-extrabold tracking-tight">Hôm Nay <span className="text-[#FF6B4A]">Ăn Gì?</span></span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden sm:flex items-center gap-1 sm:gap-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'bg-[#FF6B4A]/10 text-[#FF6B4A]'
                      : 'text-[#252525] hover:bg-neutral-100 hover:text-[#FF6B4A]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 rounded-xl text-[#252525] hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-[#EAE5DF] bg-white px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium ${
                  active
                    ? 'bg-[#FF6B4A]/10 text-[#FF6B4A]'
                    : 'text-[#252525] hover:bg-neutral-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
