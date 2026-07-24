import React from 'react';
import { X, Download, FileText, Image as ImageIcon } from 'lucide-react';
import { mediaUrl } from '../../../services/api';

type Props = {
  url: string | null;
  onClose: () => void;
  title?: string;
};

export function ReceiptViewer({ url, onClose, title = 'عرض الوصل' }: Props) {
  if (!url) return null;
  const src = mediaUrl(url) || url;
  const isPdf = /\.pdf($|\?)/i.test(src) || src.toLowerCase().includes('application/pdf');

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/55 p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg max-h-[92vh] bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#E6ECF2] bg-[#F8FAFC]">
          <div className="flex items-center gap-2 min-w-0">
            {isPdf ? (
              <FileText className="w-5 h-5 text-[#0F766E] shrink-0" />
            ) : (
              <ImageIcon className="w-5 h-5 text-[#0F766E] shrink-0" />
            )}
            <h3 className="font-bold text-[#15202b] truncate">{title}</h3>
          </div>
          <div className="flex items-center gap-1">
            <a
              href={src}
              download
              className="p-2 rounded-xl hover:bg-white text-[#0F766E]"
              title="تحميل"
            >
              <Download className="w-5 h-5" />
            </a>
            <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-[#0F172A]/5 min-h-[280px] flex items-center justify-center p-3">
          {isPdf ? (
            <iframe title="وصل PDF" src={src} className="w-full h-[70vh] rounded-xl bg-white border-0" />
          ) : (
            <img
              src={src}
              alt="وصل الدفع"
              className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).alt = 'تعذر عرض الصورة';
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
