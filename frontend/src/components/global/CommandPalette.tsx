import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/uiStore';
import { Search, User, Package, Settings, Activity, Folder, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { setRole, role } = useAuthStore();
  const openModal = useUIStore((s) => s.modal.openModal);
  const openDrawer = useUIStore((s) => s.drawer.openDrawer);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
    setQuery('');
  };

  const actions = [
    { id: 'goto-orders', label: 'الذهاب إلى الطلبات', icon: <Package className="w-4 h-4" />, onSelect: () => navigate('/orders') },
    { id: 'goto-customers', label: 'الذهاب إلى العملاء', icon: <User className="w-4 h-4" />, onSelect: () => navigate('/customers') },
    { id: 'goto-dashboard', label: 'الذهاب إلى لوحة القيادة', icon: <Activity className="w-4 h-4" />, onSelect: () => navigate('/dashboard') },
    { id: 'goto-settings', label: 'إعدادات النظام', icon: <Settings className="w-4 h-4" />, onSelect: () => navigate('/settings') },
    { id: 'create-order', label: 'إنشاء طلب جديد', icon: <Plus className="w-4 h-4 text-emerald-500" />, onSelect: () => navigate('/orders/create') },
    { id: 'create-customer', label: 'إضافة عميل جديد', icon: <Plus className="w-4 h-4 text-emerald-500" />, onSelect: () => navigate('/customers/new') },
    { id: 'switch-role-admin', label: 'تغيير الصلاحية: مدير نظام (Admin)', icon: <User className="w-4 h-4 text-purple-500" />, onSelect: () => setRole('Admin') },
    { id: 'switch-role-sales', label: 'تغيير الصلاحية: مبيعات (Sales)', icon: <User className="w-4 h-4 text-blue-500" />, onSelect: () => setRole('Sales') },
    { id: 'switch-role-prod', label: 'تغيير الصلاحية: إنتاج (Production)', icon: <User className="w-4 h-4 text-amber-500" />, onSelect: () => setRole('Production') },
  ];

  const filteredActions = query 
    ? actions.filter(a => a.label.includes(query) || a.id.includes(query.toLowerCase()))
    : actions.slice(0, 5); // Show suggestions when empty

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
          onClick={() => setIsOpen(false)} 
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-2xl bg-[var(--color-bg-card)] rounded-2xl shadow-2xl border border-[var(--color-border)] overflow-hidden"
        >
          <div className="flex items-center px-4 py-3 border-b border-[var(--color-border)]">
            <Search className="w-5 h-5 text-[var(--color-text-muted)] mr-3" />
            <input 
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن أمر، أو اذهب إلى صفحة... (مثال: طلب جديد)"
              className="flex-1 bg-transparent border-none outline-none text-[var(--color-text-main)] placeholder-[var(--color-text-muted)] text-lg"
            />
            <div className="flex items-center gap-1 text-[10px] font-mono text-[var(--color-text-muted)] bg-[var(--color-bg-main)] px-2 py-1 rounded">
              <span>ESC</span>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {filteredActions.length > 0 ? (
              <div className="space-y-1">
                {query === '' && (
                  <div className="px-3 py-2 text-xs font-bold text-[var(--color-text-muted)]">مقترحات</div>
                )}
                {filteredActions.map(action => (
                  <button
                    key={action.id}
                    onClick={() => handleAction(action.onSelect)}
                    className="w-full flex items-center gap-3 px-3 py-3 hover:bg-[var(--color-primary-500)]/10 rounded-xl transition-colors text-right group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-bg-main)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] group-hover:text-[var(--color-primary-500)] group-hover:border-[var(--color-primary-500)]/30 transition-colors">
                      {action.icon}
                    </div>
                    <span className="text-sm font-bold text-[var(--color-text-main)]">{action.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-[var(--color-text-muted)]">
                <p>لم يتم العثور على نتائج لـ "{query}"</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
