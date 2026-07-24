import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './components/PublicLayout';
import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { ProductDetails } from './pages/ProductDetails';
import { About } from './pages/About';
import { Services } from './pages/Services';
import { Projects } from './pages/Projects';
import { Contact } from './pages/Contact';

// Placeholder pages for fast delivery (these can be expanded later)
const PlaceholderPage = ({ title, desc }: { title: string, desc: string }) => (
  <div className="container mx-auto px-4 py-32 text-center min-h-[60vh] flex flex-col items-center justify-center">
    <h1 className="text-4xl font-bold mb-4">{title}</h1>
    <p className="text-[var(--color-text-muted)] max-w-lg mx-auto">{desc}</p>
  </div>
);

export const PublicStorefrontRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        
        <Route path="about" element={<About />} />
        <Route path="services" element={<Services />} />
        <Route path="catalog" element={<Catalog />} />
        <Route path="catalog/:id" element={<ProductDetails />} />
        <Route path="projects" element={<Projects />} />
        <Route path="contact" element={<Contact />} />
        
        {/* Placeholder Routes for Fast Delivery */}
        <Route 
          path="privacy" 
          element={<PlaceholderPage title="سياسة الخصوصية" desc="تفاصيل سياسة الخصوصية واستخدام البيانات في DecoZR." />} 
        />
        <Route 
          path="terms" 
          element={<PlaceholderPage title="شروط الخدمة" desc="الشروط والأحكام الخاصة باستخدام خدماتنا وموقعنا." />} 
        />

        {/* Catch-all for unknown public routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
