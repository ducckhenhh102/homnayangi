import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import WheelPage from './pages/WheelPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import AdminLoginPage from './pages/AdminLoginPage';
import NotFoundPage from './pages/NotFoundPage';
import { DiscoveryProvider } from './context/DiscoveryContext';

export default function App() {
  return (
    <BrowserRouter>
      <DiscoveryProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/wheel" element={<WheelPage />} />
            <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </DiscoveryProvider>
    </BrowserRouter>
  );
}
