import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Menu,
  X,
  User,
  Search,
  Home,
  Info,
  Grid,
  Phone,
  LayoutDashboard,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { getPublicStorefront } from '../../services/api';

export const PublicLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const totalItems = useCartStore((s) => s.totalItems());
  const accessToken = useAuthStore((s) => s.accessToken);
  const currentUser = useAuthStore((s) => s.currentUser);
  const isPortalUser = useAuthStore((s) => s.isPortalUser());
  const loggedIn = !!accessToken;
  const displayName =
    currentUser?.full_name || currentUser?.full_name_ar || currentUser?.email || 'حسابي';

  const { data: sf } = useQuery({
    queryKey: ['public', 'storefront'],
    queryFn: async () => {
      const res = await getPublicStorefront();
      return (res as any)?.data || res;
    },
    staleTime: 60_000,
  });
  const brand = sf?.brand_name || 'DecoZR';

  const navLinks = [
    { name: 'الرئيسية', path: '/', icon: <Home className="w-4 h-4" /> },
    { name: 'من نحن', path: '/about', icon: <Info className="w-4 h-4" /> },
    { name: 'الكتالوج', path: '/catalog', icon: <Grid className="w-4 h-4" /> },
    { name: 'اتصل بنا', path: '/contact', icon: <Phone className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg-main)] text-[var(--color-text-main)] font-sans flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-bg-card)]/85 backdrop-blur-xl border-b border-[var(--color-border)] shadow-sm">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-3">
              {sf?.logo_url ? (
                <img src={sf.logo_url} alt={brand} className="w-11 h-11 rounded-2xl object-cover" />
              ) : (
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-700)] flex items-center justify-center text-white font-black text-xl shadow-md shadow-[var(--color-primary-600)]/25">
                  {(brand || 'D').charAt(0)}
                </div>
              )}
              <span className="text-2xl font-black tracking-widest uppercase text-[var(--color-text-main)]">{brand}</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-sm font-bold text-[var(--color-text-muted)] hover:text-[var(--color-primary-400)]"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-4">
              <button className="p-2.5 text-[var(--color-text-muted)] rounded-xl hover:bg-[var(--color-bg-hover)]">
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/cart')}
                className="p-2.5 text-[var(--color-text-muted)] hover:text-[var(--color-primary-400)] rounded-xl hover:bg-[var(--color-bg-hover)] relative"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[1.15rem] h-[1.15rem] px-1 bg-[var(--color-primary-600)] text-white text-[10px] font-black rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
              {loggedIn ? (
                <Button
                  variant="outline"
                  className="border-[var(--color-primary-500)]/30 text-[var(--color-primary-400)] rounded-xl font-bold px-5 gap-2"
                  onClick={() => navigate(isPortalUser ? '/portal/dashboard' : '/dashboard')}
                >
                  {isPortalUser ? (
                    <LayoutDashboard className="w-4 h-4" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                  <span className="max-w-[9rem] truncate">{displayName}</span>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="border-[var(--color-primary-500)]/30 text-[var(--color-primary-400)] rounded-xl font-bold px-6"
                  onClick={() => navigate('/login')}
                >
                  <User className="w-4 h-4 ml-2" /> تسجيل الدخول
                </Button>
              )}
            </div>

            <div className="md:hidden flex items-center gap-2">
              <button onClick={() => navigate('/cart')} className="p-2.5 relative">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[var(--color-primary-500)] rounded-full" />
                )}
              </button>
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2.5">
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden"
            >
              <div className="p-4 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-4 rounded-xl font-bold"
                  >
                    {link.icon}
                    {link.name}
                  </Link>
                ))}
                <button
                  className="flex items-center gap-3 p-4 rounded-xl font-bold text-right"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate(loggedIn ? (isPortalUser ? '/portal/dashboard' : '/dashboard') : '/login');
                  }}
                >
                  <User className="w-4 h-4" />
                  {loggedIn ? displayName : 'تسجيل الدخول'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="flex-1 pt-20">
        <Outlet />
      </main>

      <footer className="border-t border-[var(--color-border)] py-8 mt-auto text-center text-sm text-[var(--color-text-muted)]">
        &copy; {new Date().getFullYear()} DecoZR Enterprise
      </footer>
    </div>
  );
};
