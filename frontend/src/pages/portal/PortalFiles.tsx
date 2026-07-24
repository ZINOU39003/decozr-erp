import React, { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { mockPortalFiles } from '../../data/mockDatabase';
import { Search, Download, Upload, File as FileIcon, Image, FileText, Layout, Folder, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';

export const PortalFiles = () => {
  const customerId = 'CUST-0001';
  
  const [files] = useState(() => mockPortalFiles.filter(f => f.customer_id === customerId));
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);

  const getFileIcon = (type: string) => {
    switch(type) {
      case 'image/png':
      case 'image/jpeg':
        return <Image className="w-8 h-8 text-[var(--color-blue-500)]" />;
      case 'application/pdf':
        return <FileText className="w-8 h-8 text-[var(--color-danger)]" />;
      case 'application/illustrator':
      case 'application/pdf':
        return <Layout className="w-8 h-8 text-[var(--color-warning)]" />;
      default:
        return <FileIcon className="w-8 h-8 text-[var(--color-primary-500)]" />;
    }
  };

  const types = Array.from(new Set(files.map(f => f.type)));

  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType ? f.type === filterType : true;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--color-text-main)]">إدارة الملفات</h1>
          <p className="text-sm text-[var(--color-text-muted)]">إدارة وتحميل الملفات الخاصة بمشاريعك.</p>
        </div>
        <Button className="bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)] shadow-lg shadow-[var(--color-primary-500)]/20" onClick={() => toast.info('جاري رفع الملفات...')}>
          <Upload className="w-4 h-4 mr-2" />
          رفع ملف جديد
        </Button>
      </div>

      <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
              <input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                type="text" 
                placeholder="ابحث عن ملف..." 
                className="w-full h-10 bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded-xl pr-10 pl-4 text-sm focus:outline-none focus:border-[var(--color-primary-500)] transition-colors"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              <Button 
                variant={filterType === null ? 'default' : 'outline'}
                onClick={() => setFilterType(null)}
                className={filterType === null ? 'bg-[var(--color-text-main)] text-[var(--color-bg-main)]' : 'border-[var(--color-border)] text-[var(--color-text-main)]'}
              >
                الكل
              </Button>
              {types.map(t => (
                <Button 
                  key={t}
                  variant={filterType === t ? 'default' : 'outline'}
                  onClick={() => setFilterType(t)}
                  className={filterType === t ? 'bg-[var(--color-text-main)] text-[var(--color-bg-main)]' : 'border-[var(--color-border)] text-[var(--color-text-main)]'}
                >
                  {t.split('/')[1] || t}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-[var(--color-border)] rounded-2xl flex flex-col items-center justify-center p-6 text-center hover:bg-[var(--color-bg-hover)] hover:border-[var(--color-primary-500)] transition-colors cursor-pointer min-h-[160px]">
              <div className="w-12 h-12 bg-[var(--color-primary-500)]/10 text-[var(--color-primary-500)] rounded-full flex items-center justify-center mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-[var(--color-text-main)]">اسحب أو انقر للرفع</p>
            </div>

            {/* Files */}
            {filteredFiles.map((file, idx) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                key={file.id} 
                className="border border-[var(--color-border)] rounded-2xl p-4 bg-[var(--color-bg-main)] hover:border-[var(--color-primary-500)] transition-colors group relative flex flex-col"
              >
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" className="w-8 h-8 p-0 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-hover)]" onClick={() => toast.info('خيارات الملف')}>
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                  {getFileIcon(file.type)}
                </div>
                <div className="mt-auto">
                  <p className="text-sm font-bold text-[var(--color-text-main)] truncate" title={file.name}>{file.name}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-1 flex justify-between">
                    <span>{file.size}</span>
                    <span>{new Date(file.created_at).toLocaleDateString('ar-DZ')}</span>
                  </p>
                </div>
                {/* Download Overlay */}
                <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <Button className="bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)] shadow-lg rounded-full w-12 h-12 p-0 flex items-center justify-center" onClick={() => toast.info('جاري تنزيل الملف...')}>
                    <Download className="w-5 h-5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredFiles.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-[var(--color-bg-main)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--color-border)]">
                <Search className="w-10 h-10 text-[var(--color-text-muted)] opacity-50" />
              </div>
              <h3 className="text-lg font-bold text-[var(--color-text-main)]">لم يتم العثور على ملفات</h3>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
