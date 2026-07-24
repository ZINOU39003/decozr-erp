/** Compress an image file to JPEG under ~maxBytes using canvas. */
export async function compressImageFile(
  file: File,
  options?: { maxWidth?: number; maxBytes?: number; quality?: number }
): Promise<File> {
  const maxWidth = options?.maxWidth ?? 1600;
  const maxBytes = options?.maxBytes ?? 1.5 * 1024 * 1024;
  const startQuality = options?.quality ?? 0.82;

  if (!file.type.startsWith('image/')) {
    throw new Error('الملف ليس صورة');
  }

  // Small enough already
  if (file.size <= maxBytes && file.type === 'image/jpeg') {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('تعذر معالجة الصورة');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let quality = startQuality;
  let blob: Blob | null = null;

  for (let i = 0; i < 6; i++) {
    blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', quality)
    );
    if (!blob) break;
    if (blob.size <= maxBytes || quality <= 0.45) break;
    quality -= 0.1;
  }

  if (!blob) {
    throw new Error('فشل ضغط الصورة');
  }

  const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
  return new File([blob], name, { type: 'image/jpeg' });
}
