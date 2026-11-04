import { supabase } from '@/lib/supabase';

/**
 * Nhờ máy chủ tìm email nội bộ từ ô đăng nhập (tên hoặc số điện thoại).
 * Lỗi mạng thì trả về null để phía gọi tự đoán theo tên — không chặn đăng nhập.
 */
export async function resolveLoginEmail(account: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke('login-resolve', {
      body: { account },
    });
    if (error) return null;
    const result = data as { ok?: boolean; email?: string } | null;
    if (!result || result.ok !== true || typeof result.email !== 'string') return null;
    return result.email.trim().toLowerCase() || null;
  } catch {
    return null;
  }
}