import React from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { CheckCircle2, QrCode, Home, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';

export const OrderSuccessPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as {
    order_number?: string;
    qr_code_token?: string;
    total?: number;
    from_portal?: boolean;
  };

  const workerUrl = state.qr_code_token
    ? `${window.location.origin}/w/${state.qr_code_token}`
    : null;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center space-y-6 p-8 rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <CheckCircle2 className="w-16 h-16 text-[var(--color-success)] mx-auto" />
        <div>
          <h1 className="text-3xl font-black mb-2">تم استلام طلبك</h1>
          <p className="text-[var(--color-text-muted)]">
            سنتواصل معك لتأكيد التفاصيل وبدء التنفيذ في الورشة.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--color-bg-main)] border border-[var(--color-border)] space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--color-text-muted)]">رقم الطلب</span>
            <span className="font-bold font-mono">{state.order_number || id}</span>
          </div>
          {typeof state.total === 'number' && (
            <div className="flex justify-between">
              <span className="text-[var(--color-text-muted)]">الإجمالي</span>
              <span className="font-bold text-[var(--color-primary-400)]">
                {state.total.toLocaleString()} د.ج
              </span>
            </div>
          )}
        </div>

        {workerUrl && (
          <div className="p-4 rounded-2xl border border-dashed border-[var(--color-border)] text-right space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <QrCode className="w-4 h-4" /> رابط متابعة الإنتاج (للورشة)
            </div>
            <code className="text-xs break-all block text-[var(--color-text-muted)]">{workerUrl}</code>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                navigator.clipboard.writeText(workerUrl);
                toast.success('تم نسخ الرابط');
              }}
            >
              <Copy className="w-4 h-4 ml-2" /> نسخ الرابط
            </Button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            className="flex-1"
            onClick={() => navigate(state.from_portal ? '/portal/catalog' : '/catalog')}
          >
            العودة للكتالوج
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate(state.from_portal ? '/portal/orders' : '/')}
          >
            <Home className="w-4 h-4 ml-2" />
            {state.from_portal ? 'طلباتي' : 'الرئيسية'}
          </Button>
        </div>
        <p className="text-xs text-[var(--color-text-muted)]">
          {state.from_portal ? (
            <>
              تابع الطلب من{' '}
              <Link to={`/portal/orders/${id}`} className="underline">
                بوابة العميل
              </Link>
            </>
          ) : (
            <>
              للمتابعة من داخل النظام:{' '}
              <Link to="/login" className="underline">
                تسجيل الدخول
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
};
