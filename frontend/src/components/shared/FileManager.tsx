import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Trash2, UploadCloud, Image as ImageIcon, FileArchive, Search, File, Edit2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { toast } from 'sonner';

export interface FileItem {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  uploadedBy: string;
  category: string;
}

interface FileManagerProps {
  files: FileItem[];
  onUpload?: () => void;
  onDelete?: (id: string) => void;
  entityId: string;
}

export const FileManager = ({ files: initialFiles, entityId }: FileManagerProps) => {
  const [files, setFiles] = useState<FileItem[]>(initialFiles);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = ['all', 'design', 'document', 'image', 'archive'];

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الملف؟')) {
      setFiles(files.filter(f => f.id !== id));
      toast.success('تم حذف الملف بنجاح');
    }
  };

  const handleUpload = () => {
    toast.success('تم رفع الملف بنجاح');
    const newFile = {
      id: Math.random().toString(),
      name: 'مستند_جديد.pdf',
      size: '1.2 MB',
      type: 'pdf',
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'أنت',
      category: 'document'
    };
    setFiles([newFile, ...files]);
  };

  const filtered = files.filter(f => {
    const matchesQuery = f.name.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = activeCategory === 'all' || f.category === activeCategory;
    return matchesQuery && matchesCategory;
  });

  const getIcon = (type: string) => {
    if (type.includes('image') || type.includes('jpg') || type.includes('png')) return <ImageIcon className="w-8 h-8 text-blue-400" />;
    if (type.includes('pdf')) return <FileText className="w-8 h-8 text-red-400" />;
    if (type.includes('zip') || type.includes('rar')) return <FileArchive className="w-8 h-8 text-yellow-400" />;
    return <File className="w-8 h-8 text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          {categories.map(cat => (
            <Badge 
              key={cat}
              variant={activeCategory === cat ? 'default' : 'outline'}
              className="cursor-pointer capitalize"
              onClick={() => setActiveCategory(cat)}
            >
              {cat === 'all' ? 'الكل' : cat}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input 
              type="text" 
              placeholder="بحث في الملفات..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[var(--color-bg-main)] border border-[var(--color-border)] rounded-lg pr-9 pl-4 py-2 text-sm focus:outline-none focus:border-[var(--color-primary-500)] text-[var(--color-text-main)] placeholder-[var(--color-text-muted)]"
            />
          </div>
          <Button onClick={handleUpload} className="flex items-center gap-2">
            <UploadCloud className="w-4 h-4" />
            <span>رفع ملف</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length > 0 ? (
          filtered.map(file => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group"
            >
              <Card className="border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden hover:border-[var(--color-primary-500)] transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg bg-[var(--color-bg-main)] flex items-center justify-center flex-shrink-0">
                      {getIcon(file.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[var(--color-text-main)] truncate" title={file.name}>{file.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">{file.size} • {new Date(file.uploadedAt).toLocaleDateString('ar-DZ')}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">بواسطة: {file.uploadedBy}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="h-8 text-xs text-[var(--color-primary-400)]">
                      <Download className="w-3 h-3 ml-1" /> تحميل
                    </Button>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--color-text-muted)] hover:text-blue-400">
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--color-text-muted)] hover:text-red-400" onClick={() => handleDelete(file.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-[var(--color-text-muted)] border-2 border-dashed border-[var(--color-border)] rounded-xl">
            <UploadCloud className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-bold mb-1">لا توجد ملفات</p>
            <p className="text-sm">قم برفع ملفات جديدة لإضافتها إلى هذه المساحة</p>
          </div>
        )}
      </div>
    </div>
  );
};
