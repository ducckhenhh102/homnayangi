import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F2] text-[#252525]">
      <Navbar />
      <main className="flex-1 py-6 sm:py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
