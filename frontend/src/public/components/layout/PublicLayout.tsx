import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShoppingCart, Menu, Search, X, Globe } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

export const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Simple scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'الرئيسية', path: '/' },
    { name: 'الكتالوج', path: '/catalog' },
    { name: 'مشاريعنا', path: '/projects' },
    { name: 'تواصل معنا', path: '/contact' },
    { name: 'من نحن', path: '/about' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-main)] text-[var(--color-text-main)] font-cairo" dir="rtl">
      {/* Sticky Navbar */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'glass-dark border-b border-[var(--color-border)] py-3' 
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-[var(--color-text-main)] p-2 -ml-2 hover:bg-[var(--color-bg-elevated)] rounded-xl transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:shadow-blue-500/25 transition-all">
                D
              </div>
              <span className="text-xl font-black tracking-tight hidden sm:block">
                Deco<span className="text-blue-500">ZR</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                  location.pathname === link.path
                    ? 'bg-blue-500/10 text-blue-500'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)]'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] transition-colors hidden sm:block hover:bg-[var(--color-bg-elevated)] rounded-full">
              <Search className="w-5 h-5" />
            </button>
            <Link to="/cart" className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] transition-colors relative hover:bg-[var(--color-bg-elevated)] rounded-full">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                0
              </span>
            </Link>
            
            <div className="w-px h-6 bg-[var(--color-border)] hidden sm:block mx-1"></div>
            
            <Button 
              variant="ghost" 
              className="hidden sm:flex hover:bg-[var(--color-bg-elevated)]"
              onClick={() => navigate('/login')}
            >
              تسجيل الدخول
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
              onClick={() => navigate('/request-quote')}
            >
              طلب عرض سعر
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div 
              initial={{ x: '100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-[var(--color-bg-main)] z-[70] lg:hidden flex flex-col shadow-2xl border-l border-[var(--color-border)]"
            >
              <div className="p-6 flex items-center justify-between border-b border-[var(--color-border)]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                    D
                  </div>
                  <span className="text-lg font-black tracking-tight">DecoZR</span>
                </div>
                <button 
                  className="p-2 text-[var(--color-text-secondary)] bg-[var(--color-bg-elevated)] rounded-full hover:text-[var(--color-text-main)] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-4 py-3 rounded-xl font-bold transition-colors ${
                      location.pathname === link.path
                        ? 'bg-blue-500/10 text-blue-500'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-main)]'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              <div className="p-6 border-t border-[var(--color-border)] flex flex-col gap-3 bg-[var(--color-bg-sidebar)]">
                <Button variant="outline" className="w-full justify-center" onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}>
                  تسجيل الدخول
                </Button>
                <Button className="w-full justify-center bg-blue-600 hover:bg-blue-700 text-white shadow-lg" onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}>
                  إنشاء حساب جديد
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 pt-24 lg:pt-28 pb-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#0f1115] border-t border-[var(--color-border)] pt-20 pb-10 mt-20 relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-30"></div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
            
            <div className="lg:col-span-2 flex flex-col items-start">
              <Link to="/" className="flex items-center gap-3 mb-6 group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
                  D
                </div>
                <span className="text-2xl font-black tracking-tight text-white">
                  Deco<span className="text-blue-500">ZR</span>
                </span>
              </Link>
              <p className="text-[var(--color-text-muted)] text-sm leading-relaxed max-w-sm mb-8">
                نظام تخطيط موارد المؤسسات المتقدم لصناعة الأثاث والديكور. نجمع بين التصميم الإبداعي والإنتاج الدقيق بمقاييس عالمية.
              </p>
              
              <div className="flex gap-4">
                {/* Social Placeholders */}
                {['twitter', 'linkedin', 'instagram', 'facebook'].map((social) => (
                  <a key={social} href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all shadow-lg hover:shadow-blue-500/25">
                    <span className="sr-only">{social}</span>
                    <div className="w-4 h-4 bg-current" style={{ clipPath: 'circle()' }}></div>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white font-bold mb-6 flex items-center gap-2">المنتجات</h3>
              <ul className="flex flex-col gap-3">
                {['ديكور داخلي', 'أثاث مكتبي', 'مطابخ حديثة', 'غرف نوم', 'إكسسوارات'].map((item) => (
                  <li key={item}>
                    <Link to="/catalog" className="text-[var(--color-text-muted)] hover:text-blue-400 transition-colors text-sm flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-blue-500/50"></span>
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold mb-6 flex items-center gap-2">الشركة</h3>
              <ul className="flex flex-col gap-3">
                {[
                  { name: 'عن ديكوزر', path: '/about' },
                  { name: 'المشاريع', path: '/projects' },
                  { name: 'الخدمات', path: '/services' },
                  { name: 'اتصل بنا', path: '/contact' },
                  { name: 'المدونة', path: '/blog' }
                ].map((item, idx) => (
                  <li key={idx}>
                    <Link to={item.path} className="text-[var(--color-text-muted)] hover:text-blue-400 transition-colors text-sm flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-blue-500/50"></span>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold mb-6 flex items-center gap-2">المساعدة</h3>
              <ul className="flex flex-col gap-3">
                {[
                  { name: 'الأسئلة الشائعة', path: '/faq' },
                  { name: 'تتبع الطلب', path: '/track-order' },
                  { name: 'طلب عرض سعر', path: '/request-quote' },
                  { name: 'الشروط والأحكام', path: '/terms' },
                  { name: 'سياسة الخصوصية', path: '/privacy' }
                ].map((item, idx) => (
                  <li key={idx}>
                    <Link to={item.path} className="text-[var(--color-text-muted)] hover:text-blue-400 transition-colors text-sm flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-blue-500/50"></span>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[var(--color-text-muted)] text-sm">
              © {new Date().getFullYear()} DecoZR Enterprise. جميع الحقوق محفوظة.
            </p>
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>المملكة العربية السعودية</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
