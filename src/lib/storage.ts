import { supabase } from '@/lib/supabase';

const BUCKET = 'media';

/**
 * Tải ảnh lên bucket công khai và trả về URL hiển thị.
 * Tên tệp được sinh tự động (chữ thường, số, dấu gạch ngang) để an toàn.
 */
export async function uploadMedia(file: File): Promise<string> {
  const rawExt = file.name.split('.').pop() ?? 'png';
  const ext = rawExt.toLowerCase().replace(/[^a-z0-9]/g, '') || 'png';
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(safeName, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(safeName);
  return data.publicUrl;
}