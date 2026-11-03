import { supabase } from '@/lib/supabase';

export type SpendResult = {
  ok: boolean;
  coins: number;
  message: string;
};

const friendly = (code: string | undefined, fallback: string) => {
  if (code === 'INSUFFICIENT') return 'Bạn đã hết coin. Nạp thêm để tiếp tục mở phiên phân tích.';
  return fallback;
};

/** Trừ coin thật trên máy chủ và ghi lại lịch sử giao dịch. */
export async function spendCoins(amount: number, note: string): Promise<SpendResult> {
  try {
    const { data, error } = await supabase.functions.invoke('spend-coins', {
      body: { amount, note },
    });

    if (error) {
      return {
        ok: false,
        coins: 0,
        message: 'Không gọi được máy chủ trừ coin. Anh kiểm tra mạng rồi thử lại giúp em nhé.',
      };
    }

    const result = data as
      | { ok?: boolean; coins?: number; code?: string; message?: string }
      | null;

    if (!result || result.ok !== true) {
      return {
        ok: false,
        coins: Number(result?.coins ?? 0),
        message: friendly(result?.code, result?.message || 'Chưa trừ được coin.'),
      };
    }

    return { ok: true, coins: Number(result.coins ?? 0), message: '' };
  } catch {
    return { ok: false, coins: 0, message: 'Không kết nối được máy chủ. Anh thử lại sau ít giây.' };
  }
}