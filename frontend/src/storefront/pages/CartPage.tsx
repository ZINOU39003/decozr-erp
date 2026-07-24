import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Loader2, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import {
  createPortalOrder,
  createPublicOrder,
  getPortalMe,
  mediaUrl,
} from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const CartPage = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, totalPrice, clear } = useCartStore();
  const isPortalUser = useAuthStore((s) => s.isPortalUser());
  const accessToken = useAuthStore((s) => s.accessToken);
  const loggedIn = !!accessToken && isPortalUser;

  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name_ar: '',
    phone: '',
    email: '',
    city: '',
    notes: '',
  });
  const [prefilled, setPrefilled] = useState(false);

  const { data: me, isLoading: meLoading } = useQuery({
    queryKey: ['portal', 'me'],
    queryFn: getPortalMe,
    enabled: loggedIn,
  });

  useEffect(() => {
    if (!me?.customer || prefilled) return;
    const c = me.customer;
    setForm((f) => ({
      ...f,
      name_ar: c.name_ar || '',
      phone: c.phone || '',
      email: c.email || me.user?.email || '',
      city: c.city || '',
    }));
    setPrefilled(true);
  }, [me, prefilled]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('السلة فارغة');
      return;
    }

    const cartItems = items.map((item) => ({
      design_id: item.designId,
      design_version_id: item.designVersionId,
      quantity: item.quantity,
      options: item.options || {},
    }));

    setSubmitting(true);
    try {
      let order: any;

      if (loggedIn) {
        order = await createPortalOrder({
          items: cartItems,
          notes: form.notes.trim() || undefined,
        });
      } else {
        if (!form.name_ar.trim() || !form.phone.trim()) {
          toast.error('الاسم ورقم الهاتف مطلوبان');
          setSubmitting(false);
          return;
        }
        order = await createPublicOrder({
          customer: {
            name_ar: form.name_ar.trim(),
            phone: form.phone.trim(),
            email: form.email.trim() || undefined,
            city: form.city.trim() || undefined,
          },
          notes: form.notes.trim() || undefined,
          items: cartItems,
        });
      }

      clear();
      toast.success(`تم إنشاء الطلب ${order.order_number}`);
      navigate(`/order-success/${order.id}`, {
        state: {
          order_number: order.order_number,
          qr_code_token: order.qr_code_token,
          total: order.total,
          from_portal: loggedIn,
        },
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'فشل إنشاء الطلب. تأكد أن الخادم يعمل.';
      toast.error(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <ShoppingBag className="w-16 h-16 text-[var(--color-text-muted)] mb-4 opacity-50" />
        <h1 className="text-2xl font-bold mb-2">السلة فارغة</h1>
        <p className="text-[var(--color-text-muted)] mb-6">أضف تصاميم من الكتالوج لطلب تنفيذها</p>
        <Button onClick={() => navigate(loggedIn ? '/portal/catalog' : '/catalog')}>
          تصفح الكتالوج
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-main)] pb-24">
      <div className="container mx-auto px-4 lg:px-8 py-12 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black">سلة الطلبات</h1>
          <button
            onClick={() => {
              clear();
              toast.success('تم تفريغ السلة');
            }}
            className="text-sm text-[var(--color-danger)] hover:underline"
          >
            تفريغ السلة
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-4">
            {items.map((item) => (
              <div
                key={item.designId}
                className="flex gap-4 p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]"
              >
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-[var(--color-bg-main)] shrink-0">
                  <img
                    src={
                      mediaUrl(item.image_url) ||
                      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=200'
                    }
                    alt={item.name_ar}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/catalog/${item.designId}`}
                    className="font-bold hover:text-[var(--color-primary-400)]"
                  >
                    {item.name_ar}
                  </Link>
                  <div className="text-sm text-[var(--color-text-muted)] font-mono mt-1">{item.code}</div>
                  <div className="text-[var(--color-primary-400)] font-bold mt-2">
                    {item.unit_price.toLocaleString()} د.ج
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => {
                      removeItem(item.designId);
                      toast.success('تم الحذف من السلة');
                    }}
                    className="p-2 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2 border border-[var(--color-border)] rounded-xl">
                    <button
                      className="p-2"
                      onClick={() => updateQuantity(item.designId, item.quantity - 1)}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold">{item.quantity}</span>
                    <button
                      className="p-2"
                      onClick={() => updateQuantity(item.designId, item.quantity + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleCheckout}
            className="lg:col-span-2 p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] h-fit space-y-4"
          >
            <h2 className="text-xl font-bold">بيانات طلب التنفيذ</h2>

            {loggedIn && (
              <div className="flex items-start gap-3 rounded-xl border border-[var(--color-primary-500)]/30 bg-[var(--color-primary-500)]/10 p-3 text-sm">
                <UserCheck className="w-5 h-5 text-[var(--color-primary-400)] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[var(--color-text-main)]">تم تعبئة بيانات حسابك</p>
                  <p className="text-[var(--color-text-muted)] text-xs mt-0.5">
                    الطلب سيُسجَّل باسمك مباشرة — أضف ملاحظات فقط إن احتجت.
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-1 block">الاسم الكامل *</label>
              <Input
                value={form.name_ar}
                onChange={(e) => setForm((f) => ({ ...f, name_ar: e.target.value }))}
                placeholder="مثال: أحمد بن علي"
                required={!loggedIn}
                readOnly={loggedIn}
                className={loggedIn ? 'opacity-90 cursor-default' : undefined}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">رقم الهاتف *</label>
              <Input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="05xxxxxxxx"
                required={!loggedIn}
                readOnly={loggedIn}
                className={loggedIn ? 'opacity-90 cursor-default' : undefined}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">البريد (اختياري)</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                readOnly={loggedIn}
                className={loggedIn ? 'opacity-90 cursor-default' : undefined}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">المدينة</label>
              <Input
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                readOnly={loggedIn}
                className={loggedIn ? 'opacity-90 cursor-default' : undefined}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">ملاحظات</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="w-full min-h-[80px] px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-main)]"
                placeholder="تفاصيل إضافية للورشة..."
              />
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[var(--color-border)]">
              <span className="text-[var(--color-text-muted)]">الإجمالي التقديري</span>
              <span className="text-2xl font-black text-[var(--color-primary-400)]">
                {totalPrice().toLocaleString()} د.ج
              </span>
            </div>

            <Button
              type="submit"
              disabled={submitting || (loggedIn && meLoading)}
              className="w-full bg-[var(--color-primary-600)] text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin ml-2" /> جاري إنشاء الطلب...
                </>
              ) : (
                <>
                  تأكيد طلب التنفيذ <ArrowRight className="w-4 h-4 mr-2" />
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => navigate(loggedIn ? '/portal/catalog' : '/catalog')}
            >
              متابعة التسوق
            </Button>
            {loggedIn && (
              <button
                type="button"
                className="w-full text-xs text-[var(--color-primary-400)] hover:underline"
                onClick={() => navigate('/portal/orders')}
              >
                عرض طلباتي في البوابة
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
