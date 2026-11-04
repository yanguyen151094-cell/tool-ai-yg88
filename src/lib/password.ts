import { supabase } from '@/lib/supabase';

export type ChangePasswordResult = { ok: true; email: string };

/** Đổi mật khẩu của chính tài khoản đang đăng nhập (người chơi hoặc admin). */
export async function changeOwnPassword(
  currentPassword: string,
  newPassword: string,
): Promise<ChangePasswordResult> {
  const { data, error } = await supabase.functions.invoke('change-password', {
    body: {
      current_password: currentPassword,
      new_password: newPassword,
    },
  });

  if (error) {
    throw new Error('Không gọi được máy chủ đổi mật khẩu. Anh kiểm tra mạng rồi thử lại giúp em.');
  }

  const result = data as { ok?: boolean; email?: string; message?: string } | null;
  if (!result || result.ok !== true) {
    throw new Error(result?.message || 'Chưa đổi được mật khẩu.');
  }
  return { ok: true, email: result.email ?? '' };
}