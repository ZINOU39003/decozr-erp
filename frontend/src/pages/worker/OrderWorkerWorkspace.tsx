import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  getOrderByQr,
  startWorkerJobByQr,
  completeWorkerJobByQr,
} from '../../services/api';
import { Package, Play, CheckCircle, Clock } from 'lucide-react';

export const OrderWorkerWorkspace = () => {
  const { token } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrder = () => {
    if (!token) return;
    setLoading(true);
    setError('');
    getOrderByQr(token)
      .then((data) => setOrder(data))
      .catch(() => {
        setOrder(null);
        setError('الطلب غير موجود أو رمز QR غير صالح.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (token) fetchOrder();
  }, [token]);

  const handleStartJob = async (jobId: string) => {
    try {
      await startWorkerJobByQr(token!, jobId);
      fetchOrder();
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message || 'خطأ في بدء المهمة');
    }
  };

  const handleCompleteJob = async (jobId: string, estimated: number) => {
    const actualStr = window.prompt(
      'أدخل الوقت الفعلي المستغرق (بالدقائق):',
      estimated?.toString() || '0'
    );
    if (actualStr !== null) {
      const actual = parseInt(actualStr, 10) || estimated || 0;
      try {
        await completeWorkerJobByQr(token!, jobId, actual);
        fetchOrder();
      } catch (err: any) {
        alert(err?.response?.data?.message || err.message || 'خطأ في إنهاء المهمة');
      }
    }
  };

  if (loading) return <div className="p-8 text-center">جاري جلب تفاصيل الطلب...</div>;
  if (!order) return <div className="p-8 text-center text-red-500">{error || 'الطلب غير موجود'}</div>;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 pb-20" dir="rtl">
      <div className="bg-slate-900 text-white p-6 rounded-b-3xl shadow-md">
        <h1 className="text-xl font-bold mb-1">طلب #{order.order_number}</h1>
        <p className="text-slate-300 text-sm mb-4">العميل: {order.customer?.name_ar}</p>

        <div className="bg-white/10 rounded-xl p-4 flex justify-between items-center">
          <span className="text-sm">حالة الطلب:</span>
          <span className="font-bold px-3 py-1 bg-blue-500 text-white rounded-full text-xs">
            {order.status}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-6 mt-2">
        <section>
          <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Package size={18} className="text-primary" />
            المنتجات المطلوبة ({order.items?.length || 0})
          </h2>
          <div className="space-y-3">
            {(order.items || []).map((item: any) => (
              <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-800">{item.design_name_snapshot}</h3>
                  <span className="bg-slate-100 text-slate-800 font-bold px-2 py-1 rounded text-sm">
                    كمية: {item.quantity}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-2">
                  الإصدار: v{item.version_number_snapshot}.0
                </p>
                <div className="bg-slate-50 p-2 rounded text-xs text-slate-600">
                  <strong className="block mb-1">المواصفات:</strong>
                  {Object.keys(item.options_snapshot || {}).length === 0 && (
                    <span>بدون تخصيص</span>
                  )}
                  {Object.entries(item.options_snapshot || {}).map(([k, v]) => (
                    <span
                      key={k}
                      className="inline-block bg-white border border-slate-200 px-2 py-0.5 rounded mr-1 mb-1"
                    >
                      {k}: {String(v)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Clock size={18} className="text-orange-500" />
            مهام الآلات
          </h2>
          <div className="space-y-3">
            {(order.machineJobs || []).length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">
                لا يوجد مهام آلات مجدولة — يجب بدء الإنتاج من لوحة الطلب أولاً
              </p>
            )}
            {(order.machineJobs || []).map((job: any) => (
              <div key={job.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-slate-800">{job.machine?.name_ar}</span>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${
                      job.status === 'pending'
                        ? 'bg-slate-100 text-slate-600'
                        : job.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {job.status === 'pending'
                      ? 'في الانتظار'
                      : job.status === 'in_progress'
                        ? 'قيد العمل'
                        : 'مكتمل'}
                  </span>
                </div>
                <div className="text-sm text-slate-600 mb-4 flex justify-between">
                  <span>المرحلة: {job.production_stage}</span>
                  <span>الوقت المقدر: {job.estimated_minutes} د</span>
                </div>

                {job.status === 'pending' && (
                  <button
                    onClick={() => handleStartJob(job.id)}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    <Play size={18} fill="currentColor" /> بدء المهمة
                  </button>
                )}

                {job.status === 'in_progress' && (
                  <button
                    onClick={() => handleCompleteJob(job.id, job.estimated_minutes)}
                    className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} /> إنهاء المهمة
                  </button>
                )}

                {job.status === 'completed' && (
                  <div className="text-center text-sm font-bold text-emerald-600 bg-emerald-50 py-2 rounded-lg">
                    اكتملت في {job.actual_minutes} دقيقة
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
