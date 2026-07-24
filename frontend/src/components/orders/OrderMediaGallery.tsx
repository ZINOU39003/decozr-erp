import React, { useRef, useState } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { compressImageFile } from '../../lib/compressImage';
import { uploadDesignImages, addOrderMedia, mediaUrl } from '../../services/api';
import { Button } from '../ui/Button';

type MediaItem = {
  url: string;
  purpose?: string;
  caption?: string;
  created_at?: string;
};

const PURPOSES = [
  { value: 'before', label: 'قبل' },
  { value: 'after', label: 'بعد' },
  { value: 'progress', label: 'تقدّم العمل' },
  { value: 'design', label: 'تصميم' },
];

export function OrderMediaGallery({
  orderId,
  images = [],
  onUpdated,
  readOnly = false,
}: {
  orderId: string;
  images?: MediaItem[];
  onUpdated?: (order: any) => void;
  readOnly?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [purpose, setPurpose] = useState('progress');
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length || readOnly) return;
    setUploading(true);
    try {
      const compressed: File[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        compressed.push(
          await compressImageFile(file, { maxWidth: 1600, maxBytes: 900 * 1024 }),
        );
      }
      if (!compressed.length) {
        toast.error('اختر صوراً صالحة');
        return;
      }
      const uploaded: any = await uploadDesignImages(compressed);
      const urls: string[] = uploaded?.urls || uploaded?.data?.urls || [];
      if (!urls.length) throw new Error('فشل الرفع');
      const order = await addOrderMedia(
        orderId,
        urls.map((url) => ({ url, purpose })),
      );
      onUpdated?.(order);
      toast.success(`تم رفع ${urls.length} صورة (مضغوطة)`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || 'فشل رفع الصور');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="h-10 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-main)] px-3 text-sm"
          >
            {PURPOSES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <Button
            type="button"
            size="sm"
            className="gap-2"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
            رفع صور متعددة
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <span className="text-xs text-[var(--color-text-muted)]">
            يُضغط تلقائياً قبل الرفع لتوفير المساحة
          </span>
        </div>
      )}

      {(!images || images.length === 0) && (
        <p className="text-sm text-[var(--color-text-muted)] border border-dashed border-[var(--color-border)] rounded-xl p-6 text-center">
          لا صور بعد — أضف صور قبل/بعد أو مراحل العمل
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {(images || []).map((img, i) => (
          <figure
            key={`${img.url}-${i}`}
            className="rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-main)]"
          >
            <a href={mediaUrl(img.url)} target="_blank" rel="noreferrer">
              <img
                src={mediaUrl(img.url)}
                alt={img.caption || img.purpose || 'media'}
                className="w-full h-32 object-cover"
                loading="lazy"
              />
            </a>
            <figcaption className="px-2 py-1.5 text-[11px] text-[var(--color-text-muted)] flex justify-between gap-2">
              <span>
                {PURPOSES.find((p) => p.value === img.purpose)?.label || img.purpose || 'صورة'}
              </span>
              {img.created_at && (
                <span>{new Date(img.created_at).toLocaleDateString('ar-DZ')}</span>
              )}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
