import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Package, Users, FileText, ArrowRight, X } from 'lucide-react';
import { mockOrders, mockCustomers, mockInvoices } from '../../data/mockDatabase';

export const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelect = (path: string) => {
    setIsOpen(false);
    setQuery('');
    navigate(path);
  };

  const filteredOrders = mockOrders.filter(o => 
    o.id.toLowerCase().includes(query.toLowerCase()) || 
    (o.customer_name && o.customer_name.toLowerCase().includes(query.toLowerCase()))
  ).slice(0, 3);

  const filteredCustomers = mockCustomers.filter(c => 
    (c.name && c.name.toLowerCase().includes(query.toLowerCase())) || 
    (c.phone && c.phone.includes(query))
  ).slice(0, 3);

  const filteredInvoices = mockInvoices.filter(i => 
    i.id.toLowerCase().includes(query.toLowerCase()) || 
    (i.customer && i.customer.toLowerCase().includes(query.toLowerCase()))
  ).slice(0, 3);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-[10%] left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl shadow-2xl z-[101] overflow-hidden"
          >
            <div className="flex items-center px-4 py-3 border-b border-[var(--color-border)]">
              <Search className="w-5 h-5 text-[var(--color-text-muted)] mr-3" />
              <input
                type="text"
                autoFocus
                placeholder="ابحث عن الطلبات، العملاء، الفواتير... (Ctrl + K)"
                className="flex-1 bg-transparent border-none outline-none text-[var(--color-text-main)] text-lg placeholder-[var(--color-text-muted)]"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md hover:bg-[var(--color-bg-main)] text-[var(--color-text-muted)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2 space-y-4" dir="rtl">
              {query === '' ? (
                <div className="p-8 text-center text-[var(--color-text-muted)]">
                  <p>اكتب للبحث في جميع أنحاء النظام</p>
                </div>
              ) : (
                <>
                  {filteredOrders.length > 0 && (
                    <div>
                      <div className="px-3 py-1 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">الطلبات</div>
                      {filteredOrders.map(order => (
                        <button
                          key={order.id}
                          onClick={() => handleSelect(`/orders/${order.id}`)}
                          className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-[var(--color-primary-500)]/10 text-right group transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-[var(--color-primary-500)]/20 flex items-center justify-center text-[var(--color-primary-500)]">
                              <Package className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-[var(--color-text-main)] group-hover:text-[var(--color-primary-500)] transition-colors">
                                {order.id}
                              </p>
                              <p className="text-sm text-[var(--color-text-muted)]">{order.customer_name}</p>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary-500)] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                        </button>
                      ))}
                    </div>
                  )}

                  {filteredCustomers.length > 0 && (
                    <div>
                      <div className="px-3 py-1 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">العملاء</div>
                      {filteredCustomers.map(customer => (
                        <button
                          key={customer.id}
                          onClick={() => handleSelect(`/customers`)}
                          className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-[var(--color-primary-500)]/10 text-right group transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-[var(--color-primary-500)]/20 flex items-center justify-center text-[var(--color-primary-500)]">
                              <Users className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-[var(--color-text-main)] group-hover:text-[var(--color-primary-500)] transition-colors">
                                {customer.name}
                              </p>
                              <p className="text-sm text-[var(--color-text-muted)]">{customer.phone}</p>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary-500)] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                        </button>
                      ))}
                    </div>
                  )}

                  {filteredInvoices.length > 0 && (
                    <div>
                      <div className="px-3 py-1 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">الفواتير</div>
                      {filteredInvoices.map(invoice => (
                        <button
                          key={invoice.id}
                          onClick={() => handleSelect(`/reports`)}
                          className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-[var(--color-primary-500)]/10 text-right group transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-[var(--color-primary-500)]/20 flex items-center justify-center text-[var(--color-primary-500)]">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-[var(--color-text-main)] group-hover:text-[var(--color-primary-500)] transition-colors">
                                {invoice.id}
                              </p>
                              <p className="text-sm text-[var(--color-text-muted)]">{invoice.customer}</p>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary-500)] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                        </button>
                      ))}
                    </div>
                  )}

                  {filteredOrders.length === 0 && filteredCustomers.length === 0 && filteredInvoices.length === 0 && (
                    <div className="p-8 text-center text-[var(--color-text-muted)]">
                      <p>لم يتم العثور على نتائج لـ "{query}"</p>
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="px-4 py-2 border-t border-[var(--color-border)] bg-[var(--color-bg-main)] text-xs text-[var(--color-text-muted)] flex justify-between">
              <span>استخدم الأسهم للتنقل و Enter للاختيار</span>
              <span>ESC للإغلاق</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
