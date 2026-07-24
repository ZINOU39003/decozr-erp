import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Plus, Settings2, Trash2 } from 'lucide-react';
import { apiClient } from '../../core/api/client';

export const CustomizationEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For MVP, we fetch the first version of the design
    apiClient.get(`/designs/${id}/versions`)
      .then(response => {
        const data = response.data;
        if (data && data.length > 0) {
          setOptions(data[0].customizationOptions || []);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddOption = () => {
    // In a real app, this would open a modal to add option
    const newOption = {
      option_type: 'size',
      name_ar: 'حجم جديد',
      values_json: { values: ['صغير', 'كبير'] },
      is_required: true
    };
    // fetchApi to POST new option
  };

  if (loading) return <div className="p-8">جاري التحميل...</div>;

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(`/designs/${id}`)} className="p-2 bg-slate-200 text-slate-600 rounded-full hover:bg-slate-300 transition">
            <ArrowRight size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">خيارات التخصيص</h1>
            <p className="text-slate-500 mt-1">إعداد الخيارات المتاحة للعميل (مثل الحجم، اللون، نوع الإضاءة)</p>
          </div>
        </div>
        <button onClick={handleAddOption} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition shadow-md shadow-blue-200 font-semibold">
          <Plus size={18} />
          <span>إضافة خيار</span>
        </button>
      </div>

      <div className="space-y-4">
        {options.map((opt) => (
          <div key={opt.id} className="glass rounded-xl p-5 border border-slate-200/60 flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                <Settings2 size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">{opt.name_ar} <span className="text-sm font-normal text-slate-500">({opt.option_type})</span></h3>
                <p className="text-slate-500 text-sm mt-1">القيم المتاحة: {JSON.stringify(opt.values_json)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="text-red-500 hover:text-red-700 transition p-2 bg-slate-50 rounded-lg hover:bg-red-50" onClick={() => toast.info('جاري تنفيذ الإجراء...')}>
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {options.length === 0 && (
          <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-200">
            <p>لا يوجد خيارات تخصيص. انقر على "إضافة خيار" للبدء.</p>
          </div>
        )}
      </div>
    </div>
  );
};
