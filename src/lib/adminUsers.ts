import { supabase } from '@/lib/supabase';

type AdminUserResult = { ok?: boolean; message?: string };

async function callAdminUsers(body: Record<string, unknown>): Promise<AdminUserResult> {
  const { data, error } = await supabase.functions.invoke('admin-users', { body });
  if (error) {
    throw new Error('Không gọi được máy chủ quản trị. Anh kiểm tra mạng rồi thử lại giúp em.');
  }
  const result = data as AdminUserResult | null;
  if (!result || result.ok !== true) {
    throw new Error(result?.message || 'Thao tác không thành công.');
  }
  return result;
}

/** Đặt lại mật khẩu đăng nhập cho một khách. */
export function resetUserPassword(userId: string, password: string) {
  return callAdminUsers({ action: 'reset_user_password', user_id: userId, password });
}

/** Xóa hẳn tài khoản khách cùng dữ liệu liên quan. */
export function deleteUserAccount(userId: string) {
  return callAdminUsers({ action: 'delete_user', user_id: userId });
}

/** Sinh mật khẩu tạm dễ đọc, tránh ký tự dễ nhầm. */
export function suggestPassword(length = 10): string {
  const alphabet = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('');
}