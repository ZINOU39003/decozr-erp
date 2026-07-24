import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/useAuthStore';
import { Button } from '../../../components/ui/Button';
import { Mail, Lock, LogIn, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export const UnifiedLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const isPortalUser = useAuthStore((state) => state.isPortalUser);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('الرجاء إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        toast.success('تم تسجيل الدخول بنجاح');
        setTimeout(() => {
          navigate(isPortalUser() ? '/portal/dashboard' : '/dashboard');
        }, 300);
      } else {
        toast.error('بيانات الدخول غير صحيحة. يرجى المحاولة مرة أخرى.');
      }
    } catch (err) {
      toast.error('حدث خطأ أثناء الاتصال بالخادم.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-main)] flex flex-col md:flex-row font-cairo">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-24 py-12 relative z-10">
        <div className="absolute top-8 left-8">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors"
          >
            <ArrowRight className="w-4 h-4" /> العودة للمتجر
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="mb-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-700)] flex items-center justify-center text-white font-black text-3xl shadow-lg shadow-[var(--color-primary-500)]/30 mx-auto mb-6">
              D
            </div>
            <h1 className="text-3xl font-black mb-2">مرحباً بعودتك</h1>
            <p className="text-[var(--color-text-muted)]">الرجاء إدخال بياناتك للدخول إلى النظام</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-3 leading-relaxed">
              ورشة: <span dir="ltr">admin@decozr.local</span> / admin123
              <br />
              عميل: <span dir="ltr">customer@decozr.local</span> / customer123
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--color-text-muted)]">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@decozr.local"
                  className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl px-12 py-4 text-sm focus:outline-none focus:border-[var(--color-primary-500)] transition-colors"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-[var(--color-text-muted)]">كلمة المرور</label>
                <a href="#" className="text-xs font-bold text-[var(--color-primary-500)] hover:text-[var(--color-primary-400)] transition-colors">
                  نسيت كلمة المرور؟
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl px-12 py-4 text-sm focus:outline-none focus:border-[var(--color-primary-500)] transition-colors tracking-widest"
                  dir="ltr"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-4 text-lg rounded-xl bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-500)] text-white font-bold shadow-lg shadow-[var(--color-primary-500)]/20 transition-all hover:scale-[1.02] disabled:hover:scale-100 disabled:opacity-70 mt-4"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>تسجيل الدخول <LogIn className="w-5 h-5 mr-2" /></>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-[var(--color-text-muted)]">
            هل أنت عميل جديد وتبحث عن خدماتنا؟ {' '}
            <a href="/contact" className="font-bold text-[var(--color-primary-500)] hover:text-[var(--color-primary-400)] transition-colors">
              تواصل معنا
            </a>
          </div>
        </motion.div>
      </div>

      {/* Right side - Branding/Image */}
      <div className="hidden md:flex flex-1 bg-[var(--color-bg-card)] border-r border-[var(--color-border)] relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[var(--color-primary-500)]/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[var(--color-primary-400)]/10 rounded-full blur-[100px]"></div>
        </div>
        
        <div className="relative z-10 max-w-lg text-center">
          <h2 className="text-4xl font-black mb-6 leading-tight">نظام متكامل لإدارة صناعة الأثاث والديكور</h2>
          <p className="text-lg text-[var(--color-text-muted)] leading-relaxed">
            المنصة الأقوى للتحكم في كافة موارد شركتك، من متابعة خطوط الإنتاج والطلبات إلى إدارة المخزون والموارد البشرية.
          </p>
        </div>
      </div>
    </div>
  );
};
