import { supabase } from '@/lib/supabase';

export type StaffRow = {
  user_id: string;
  username: string | null;
  can_view_customers: boolean;
  ref_code: string | null;
  created_at: string;
  customer_count: number;
  total_credited: number;
};

export type CustomerRow = {
  id: string;
  email: string | null;
  username: string | null;
  coins: number;
  phone: string | null;
  telegram: string | null;
  agent_id: string | null;
  created_at: string;
};

export type AgencyInfo = {
  username: string | null;
  ref_code: string | null;
  customer_count: number;
  total_credited: number;
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

/** Đường dẫn đăng ký riêng của một đại lý. */
export function buildRefLink(code: string): string {
  const base = (__BASE_PATH__ || '/').replace(/\/+$/, '');
  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  return `${origin}${base}/login?ref=${encodeURIComponent(code)}`;
}

/** Sinh mật khẩu tạm dễ đọc, tránh ký tự dễ nhầm. */
export function suggestPassword(length = 10): string {
  const alphabet = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('');
}

// ---------- Chủ web: quản lý đại lý ----------
export const listStaff = () => callAdminStaff<{ items: StaffRow[] }>({ action: 'list_staff' });

export const createStaff = (input: {
  username: string;
  password: string;
  ref_code?: string;
}) => callAdminStaff<{ ref_code: string }>({ action: 'create_staff', ...input });

export const updateRefCode = (userId: string, refCode: string) =>
  callAdminStaff<{ ref_code: string }>({
    action: 'update_ref_code',
    user_id: userId,
    ref_code: refCode,
  });

export const resetStaffPassword = (userId: string, password: string) =>
  callAdminStaff({ action: 'reset_password', user_id: userId, password });

export const removeStaff = (userId: string) =>
  callAdminStaff({ action: 'remove_staff', user_id: userId });

// ---------- Dùng chung: khách hàng trong phạm vi được phép ----------
export const listCustomers = () =>
  callAdminStaff<{ items: CustomerRow[] }>({ action: 'list_customers' });

export const customerHistory = (userId: string) =>
  callAdminStaff<{ items: CreditLog[] }>({ action: 'customer_history', user_id: userId });

export const creditCustomer = (userId: string, amount: number, note: string) =>
  callAdminStaff<{ username: string | null; amount: number }>({
    action: 'credit',
    user_id: userId,
    amount,
    note,
  });

export const resetCustomerPassword = (userId: string, password: string) =>
  callAdminStaff<{ username: string | null }>({
    action: 'reset_customer_password',
    user_id: userId,
    password,
  });

export const deleteCustomer = (userId: string) =>
  callAdminStaff<{ username: string | null }>({ action: 'delete_customer', user_id: userId });

export const myAgency = () => callAdminStaff<{ agency: AgencyInfo }>({ action: 'my_agency' });