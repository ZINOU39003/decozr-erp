import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProductDetail } from '../../hooks/usePublicQueries';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, ShoppingCart, Truck, Shield, Check, ChevronRight } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading } = useProductDetail(id || '');
  const [activeImage, setActiveImage] = useState(0);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 animate-pulse">
        <div className="h-8 w-1/4 bg-[var(--color-bg-elevated)] rounded mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-[var(--color-bg-elevated)] rounded-3xl"></div>
          <div className="space-y-6">
            <div className="h-10 w-3/4 bg-[var(--color-bg-elevated)] rounded"></div>
            <div className="h-6 w-1/4 bg-[var(--color-bg-elevated)] rounded"></div>
            <div className="h-32 w-full bg-[var(--color-bg-elevated)] rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 text-center">
        <h1 className="text-3xl font-black mb-4">المنتج غير موجود</h1>
        <p className="text-[var(--color-text-secondary)] mb-8">عذراً، لم نتمكن من العثور على المنتج الذي تبحث عنه.</p>
        <Link to="/catalog">
          <Button>العودة للكتالوج</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 lg:py-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-8 font-bold">
        <Link to="/" className="hover:text-blue-500 transition-colors">الرئيسية</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/catalog" className="hover:text-blue-500 transition-colors">الكتالوج</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-[var(--color-text-main)]">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Images */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
            <img 
              src={product.images[activeImage]} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
            {product.isNew && (
              <div className="absolute top-6 right-6 bg-blue-600 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg">
                جديد
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((img, idx) => (
              <button 
                key={idx}
                className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-transparent hover:border-[var(--color-border)]'}`}
                onClick={() => setActiveImage(idx)}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <div className="text-sm font-bold text-blue-500 mb-2 uppercase tracking-wider">{product.categoryName}</div>
          <h1 className="text-3xl lg:text-4xl font-black mb-4 leading-tight">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
              <span className="font-bold text-lg">{product.rating}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-[var(--color-border)]"></div>
            <span className="text-[var(--color-text-secondary)] underline decoration-[var(--color-border)] underline-offset-4 cursor-pointer hover:text-blue-500">
              {product.reviewsCount} تقييم
            </span>
          </div>

          <div className="flex items-end gap-3 mb-8">
            <div className="text-4xl font-black text-blue-500">{product.price.toLocaleString()} ر.س</div>
            {product.originalPrice && (
              <div className="text-lg text-[var(--color-text-muted)] line-through mb-1">
                {product.originalPrice.toLocaleString()} ر.س
              </div>
            )}
          </div>

          <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed mb-8">
            {product.description}
          </p>

          <div className="space-y-6 mb-8 py-6 border-y border-[var(--color-border)]">
            {/* Dimensions */}
            <div>
              <h3 className="font-bold mb-2">الأبعاد</h3>
              <div className="text-[var(--color-text-secondary)]">{product.dimensions}</div>
            </div>

            {/* Colors */}
            <div>
              <h3 className="font-bold mb-3">الألوان المتاحة</h3>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-[var(--color-bg-elevated)] px-3 py-1.5 rounded-full border border-[var(--color-border)]">
                    <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: color.hex }}></span>
                    <span className="text-sm font-bold">{color.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Materials */}
            <div>
              <h3 className="font-bold mb-3">المواد المستخدمة</h3>
              <div className="flex flex-wrap gap-2">
                {product.materials.map((mat, idx) => (
                  <span key={idx} className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] px-4 py-2 rounded-xl text-sm font-bold">
                    {mat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button size="lg" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-2xl text-lg shadow-xl shadow-blue-500/20">
              <ShoppingCart className="w-5 h-5 ml-2" />
              أضف إلى السلة
            </Button>
            <Button size="lg" variant="outline" className="h-14 rounded-2xl text-lg border-[var(--color-border)] hover:bg-[var(--color-bg-elevated)]">
              طلب تفصيل مخصص
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
            <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
              <div className="w-10 h-10 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center text-blue-500 shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm">توصيل سريع ومجاني</span>
            </div>
            <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
              <div className="w-10 h-10 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center text-emerald-500 shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm">ضمان الجودة 5 سنوات</span>
            </div>
            <div className="flex items-center gap-3 text-[var(--color-text-secondary)] col-span-1 sm:col-span-2">
              <div className="w-10 h-10 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center text-purple-500 shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm">دفع إلكتروني آمن وموثوق</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
