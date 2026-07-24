import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ShoppingCart, Save, User as UserIcon } from 'lucide-react';
import { getDesigns, getCustomers, calculatePrice, createOrder } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export const CreateOrder = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [customers, setCustomers] = useState<any[]>([]);
  const [designs, setDesigns] = useState<any[]>([]);

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedDesignId, setSelectedDesignId] = useState('');
  const [selectedVersionId, setSelectedVersionId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customizationOptions, setCustomizationOptions] = useState<any>({});

  const [livePrice, setLivePrice] = useState(0);
  const [baseCatalogPrice, setBaseCatalogPrice] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCustomers({ limit: 100 }), getDesigns({ catalog: true })])
      .then(([customersData, designsData]: any[]) => {
        setCustomers(Array.isArray(customersData) ? customersData : customersData?.data || []);
        setDesigns(Array.isArray(designsData) ? designsData : designsData?.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDesignChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const designId = e.target.value;
    setSelectedDesignId(designId);

    const design = designs.find((d) => d.id === designId);
    if (design && design.versions?.length > 0) {
      const v =
        design.versions.find((ver: any) => ver.id === design.current_version_id) ||
        design.versions[0];
      setSelectedVersionId(v.id);
      setCustomizationOptions({});
    } else {
      setSelectedVersionId('');
    }
  };

  useEffect(() => {
    if (!selectedVersionId) {
      setLivePrice(0);
      setBaseCatalogPrice(0);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const priceCalc: any = await calculatePrice({
          design_version_id: selectedVersionId,
          price_list_id: customers.find((c) => c.id === selectedCustomerId)?.price_list_id,
          options: customizationOptions,
        });
        if (cancelled) return;
        setLivePrice(Number(priceCalc.total_price ?? priceCalc.final_price ?? 0));
        setBaseCatalogPrice(Number(priceCalc.base_price ?? 0));
      } catch (err) {
        console.error(err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedVersionId, selectedCustomerId, customizationOptions, customers]);

  const handleSubmit = async () => {
    if (!selectedCustomerId || !selectedVersionId) return alert('الرجاء اختيار العميل والتصميم');

    try {
      const order = await createOrder({
        customer_id: selectedCustomerId,
        items: [
          {
            design_id: selectedDesignId,
            design_version_id: selectedVersionId,
            quantity,
            options: customizationOptions,
          },
        ],
      });
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      navigate(`/orders/${order.id}`);
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء إنشاء الطلب');
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-[var(--color-text-muted)] animate-pulse">
        جاري التحميل...
      </div>
    );
  }

  const lineTotal = livePrice * quantity;

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-main)]">إنشاء طلب جديد</h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            تحديد العميل والتصاميم المطلوبة ومحرك التخصيص
          </p>
        </div>
        <Button
          onClick={handleSubmit}
          className="flex items-center gap-2 bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-500)] text-white border-0 shadow-lg shadow-[var(--color-primary-500)]/20"
        >
          <Save size={18} />
          <span>حفظ الطلب</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <CardHeader className="border-b border-[var(--color-border)] pb-4 mb-4">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <UserIcon className="text-[var(--color-primary-400)]" size={20} />
              معلومات العميل
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-main)] mb-2">
                العميل الحالي
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)] outline-none text-[var(--color-text-main)] transition-all"
              >
                <option value="">-- اختر العميل --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_ar} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <CardHeader className="border-b border-[var(--color-border)] pb-4 mb-4">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <ShoppingCart className="text-[var(--color-primary-400)]" size={20} />
              تحديد التصميم
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-main)] mb-2">
                التصميم
              </label>
              <select
                value={selectedDesignId}
                onChange={handleDesignChange}
                className="w-full px-4 py-2.5 bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)] outline-none text-[var(--color-text-main)] transition-all"
              >
                <option value="">-- اختر التصميم --</option>
                {designs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name_ar} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-[var(--color-text-main)] mb-2">
                  الكمية
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)] outline-none text-[var(--color-text-main)] transition-all"
                />
              </div>
            </div>

            {livePrice > 0 && (
              <div className="p-4 bg-[var(--color-success)]/10 text-[var(--color-text-main)] border border-[var(--color-success)]/30 rounded-lg space-y-2 mt-4 animate-fade-in text-sm">
                {baseCatalogPrice > 0 && (
                  <div className="flex justify-between text-[var(--color-text-muted)]">
                    <span>سعر الكتالوج الأساسي</span>
                    <span>{baseCatalogPrice.toLocaleString()} د.ج</span>
                  </div>
                )}
                <div className="flex justify-between font-bold">
                  <span>سعر الوحدة (بعد قائمة الأسعار/التخصيص)</span>
                  <span>{livePrice.toLocaleString()} د.ج</span>
                </div>
                <div className="flex justify-between font-black text-[var(--color-success)] text-base border-t border-[var(--color-success)]/20 pt-2">
                  <span>إجمالي البند ({quantity} ×)</span>
                  <span>{lineTotal.toLocaleString()} د.ج</span>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed pt-1">
                  سعر المتجر العام قد يختلف عن سعر الطلب حسب قائمة أسعار العميل والتخصيص والكمية.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
