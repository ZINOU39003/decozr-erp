import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, ArrowLeft } from 'lucide-react';

export const WorkerQRScan = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      navigate(`/w/${token.trim()}`);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white/10 p-6 rounded-full mb-8">
        <QrCode size={64} className="text-primary-300" />
      </div>
      
      <h1 className="text-2xl font-bold text-white mb-2">بوابة العامل</h1>
      <p className="text-slate-400 mb-10">امسح رمز الـ QR أو أدخل الرمز يدوياً للوصول إلى تفاصيل الطلب</p>
      
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div>
          <input 
            type="text" 
            placeholder="أدخل رمز الطلب (QR Token)..." 
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-2xl text-white text-center text-lg focus:outline-none focus:border-primary-400 focus:bg-white/10 transition placeholder-slate-500"
          />
        </div>
        
        <button 
          type="submit"
          className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-blue-600 transition shadow-lg shadow-blue-900/50"
        >
          فتح الطلب
        </button>
      </form>
      
      <button 
        onClick={() => navigate('/dashboard')}
        className="mt-12 flex items-center gap-2 text-slate-400 hover:text-white transition"
      >
        <ArrowLeft size={16} /> العودة للوحة التحكم
      </button>
    </div>
  );
};
