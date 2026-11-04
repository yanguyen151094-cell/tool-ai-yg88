import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

/** Trang dự phòng khi đại lý chưa đặt link nạp riêng. */
export const DEPOSIT_FALLBACK_PATH = '/#pricing';

/** Chỉ chấp nhận link http/https để tránh link rác hoặc javascript:. */
export function normalizeDepositUrl(raw: string): string | null {
  const value = raw.trim().slice(0, 500);
  if (!value) return '';
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

let cache: { userId: string; url: string; at: number } | null = null;

/** Đọc link nạp của đại lý đang gắn với khách (hoặc mặc định của chủ web). */
export async function fetchDepositUrl(userId: string, force = false): Promise<string> {
  if (!force && cache && cache.userId === userId && Date.now() - cache.at < 60_000) {
    return cache.url;
  }
  try {
    const { data, error } = await supabase.functions.invoke('admin-staff', {
      body: { action: 'resolve_deposit' },
    });
    if (error) throw error;
    const payload = data as { ok?: boolean; url?: string } | null;
    const url = payload?.ok ? String(payload.url ?? '') : '';
    cache = { userId, url, at: Date.now() };
    return url;
  } catch {
    return cache?.userId === userId ? cache.url : '';
  }
}

/** Hook lấy link nạp cho người dùng đang đăng nhập. */
export function useDepositUrl(userId: string | null | undefined) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setUrl('');
      return undefined;
    }
    let active = true;
    setLoading(true);
    fetchDepositUrl(userId)
      .then((value) => {
        if (active) setUrl(value);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  const reload = useCallback(async () => {
    if (!userId) return;
    const value = await fetchDepositUrl(userId, true);
    setUrl(value);
  }, [userId]);

  return { url, loading, reload };
}

/** Đặt link nạp cho chính tài khoản admin đang đăng nhập. */
export async function saveMyDepositUrl(raw: string): Promise<string> {
  const normalized = normalizeDepositUrl(raw);
  if (normalized === null) {
    throw new Error('Link nạp phải bắt đầu bằng http:// hoặc https://');
  }
  const { data, error } = await supabase.functions.invoke('admin-staff', {
    body: { action: 'set_deposit_link', deposit_url: normalized },
  });
  if (error) throw new Error('Không gọi được máy chủ. Anh kiểm tra mạng rồi thử lại.');
  const payload = data as { ok?: boolean; message?: string; deposit_url?: string } | null;
  if (!payload?.ok) throw new Error(payload?.message || 'Chưa lưu được link nạp.');
  cache = null;
  return String(payload.deposit_url ?? normalized);
}

/** Chủ web đặt link nạp cho một đại lý cụ thể. */
export async function saveStaffDepositUrl(userId: string, raw: string): Promise<string> {
  const normalized = normalizeDepositUrl(raw);
  if (normalized === null) {
    throw new Error('Link nạp phải bắt đầu bằng http:// hoặc https://');
  }
  const { data, error } = await supabase.functions.invoke('admin-staff', {
    body: { action: 'set_staff_deposit', user_id: userId, deposit_url: normalized },
  });
  if (error) throw new Error('Không gọi được máy chủ. Anh kiểm tra mạng rồi thử lại.');
  const payload = data as { ok?: boolean; message?: string; deposit_url?: string } | null;
  if (!payload?.ok) throw new Error(payload?.message || 'Chưa lưu được link nạp.');
  cache = null;
  return String(payload.deposit_url ?? normalized);
}