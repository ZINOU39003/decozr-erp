import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Users } from 'lucide-react';
import { CustomerForm } from '../../components/forms/CustomerForm';
import { unlockDocumentUi, useUIStore } from '../../store/uiStore';

/** Full-page customer create — works even if modals fail on mobile */
export const CustomerCreate = () => {
  const navigate = useNavigate();

  // Ensure any leftover modal lock is cleared
  React.useEffect(() => {
    useUIStore.getState().modal.closeModal();
    unlockDocumentUi();
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6" dir="rtl">
      <div className="flex items-center gap-3">
        <Link
          to="/customers"
          className="p-2 rounded-xl border border-[#E6ECF2] bg-white hover:bg-[#F8FAFC]"
        >
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-[#15202b] flex items-center gap-2">
            <Users className="text-[#0F766E]" /> إضافة عميل جديد
          </h1>
          <p className="text-sm text-[#64748B] mt-1">أدخل بيانات العميل ويمكن تفعيل بوابته مباشرة</p>
        </div>
      </div>

      <div className="rounded-3xl border border-[#E6ECF2] bg-white p-5 sm:p-6 shadow-sm">
        <CustomerForm
          defaultValues={{}}
          onSuccess={() => navigate('/customers')}
          onCancel={() => navigate('/customers')}
        />
      </div>
    </div>
  );
};
