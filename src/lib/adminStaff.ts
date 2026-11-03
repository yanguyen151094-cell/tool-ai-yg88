import { supabase } from '@/lib/supabase';

export type StaffRow = {
  user_id: string;
  username: string | null;
  can_view_customers: boolean;
  created_at: string;
};

export type CreditCustomer = { id: string; username: string | null };

export type CreditLog = { id: string; amount: number; note: string | null; created_at: string };

type StaffResult<T> = { ok?: boolean; message?: string } & T;

export async function callAdminStaff<T extends object>(
  body: Record<string, unknown>,
): Promise<StaffResult<T>> {
  const { data, error } = await supabase.functions.invoke('admin-staff', { body });
  if (error) {
    throw new Error('Không gọi được máy chủ quản trị. Anh kiểm tra mạng rồi thử lại giúp em.');
  }
  const result = data as StaffResult<T> | null;
  if (!result || result.ok !== true) {
    throw new Error(result?.message || 'Thao tác không thành công.');
  }
  return result;
}