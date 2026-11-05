import { supabase } from '@/lib/supabase';

/** Trạng thái của một giao dịch nạp tiền. */
export type DepositStatus = 'success' | 'pending' | 'failed';

export type DepositTx = {
  id: string;
  customerId: string | null;
  customerName: string;
  channel: string;
  code: string;
  message: string;
  amount: number;
  credited: number;
  bonus: number;
  fee: number;
  eventName: string;
  note: string;
  status: DepositStatus;
  depositedAt: string;
};

export type DepositTxRow = {
  id: string;
  customer_id: string | null;
  customer_name: string | null;
  channel: string | null;
  code: string | null;
  message: string | null;
  amount: number | string | null;
  credited: number | string | null;
  bonus: number | string | null;
  fee: number | string | null;
  event_name: string | null;
  note: string | null;
  status: string | null;
  deposited_at: string | null;
};

export type DepositTxInput = {
  customerId: string | null;
  customerName: string;
  channel: string;
  code: string;
  message: string;
  amount: number;
  credited: number;
  bonus: number;
  fee: number;
  eventName: string;
  note: string;
  status: DepositStatus;
  depositedAt: string;
};

export const DEPOSIT_STATUSES: DepositStatus[] = ['success', 'pending', 'failed'];

export const DEPOSIT_STATUS_LABEL: Record<DepositStatus, string> = {
  success: 'Thành công',
  pending: 'Chờ xử lý',
  failed: 'Thất bại',
};

/** Bộ loại tiền nạp gợi ý — vẫn cho phép nhập loại khác. */
export const DEPOSIT_CHANNELS = [
  'Momo QR',
  'LIO BANK',
  'BANK VCB',
  'BANK ACB',
  'BANK TECHCOMBANK',
  'USDT TRC20',
  'Thẻ cào',
];

export const depositMoney = (value: number) =>
  Number(value ?? 0).toLocaleString('vi-VN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const pad = (value: number) => String(value).padStart(2, '0');

export const depositDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const depositDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return `${depositDate(value)} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds(),
  )}`;
};

export const depositDayMonth = (value: Date) => `${pad(value.getMonth() + 1)}/${pad(value.getDate())}`;

/** Đổi ISO sang giá trị cho ô datetime-local. */
export const toDateTimeInput = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
};

export type RangeTab = 'today' | 'yesterday' | 'week';

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);

/** Khoảng thời gian tương ứng từng tab. */
export function rangeOf(tab: RangeTab): { from: Date; to: Date } {
  const now = new Date();
  if (tab === 'today') return { from: startOfDay(now), to: now };
  if (tab === 'yesterday') {
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    return { from: startOfDay(yesterday), to: new Date(startOfDay(now).getTime() - 1) };
  }
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
  return { from: startOfDay(from), to: now };
}

const mapRow = (row: DepositTxRow): DepositTx => ({
  id: row.id,
  customerId: row.customer_id ?? null,
  customerName: row.customer_name ?? '',
  channel: row.channel ?? 'Momo QR',
  code: row.code ?? '',
  message: row.message ?? '',
  amount: Number(row.amount ?? 0),
  credited: Number(row.credited ?? 0),
  bonus: Number(row.bonus ?? 0),
  fee: Number(row.fee ?? 0),
  eventName: row.event_name ?? '',
  note: row.note ?? '',
  status:
    row.status === 'pending' || row.status === 'failed'
      ? (row.status as DepositStatus)
      : 'success',
  depositedAt: row.deposited_at ?? new Date().toISOString(),
});

/** Đọc toàn bộ lịch sử nạp (chỉ admin được cấp quyền đọc được nhờ RLS). */
export async function loadDepositTransactions(): Promise<DepositTx[]> {
  const { data, error } = await supabase
    .from('deposit_transactions')
    .select(
      'id, customer_id, customer_name, channel, code, message, amount, credited, bonus, fee, event_name, note, status, deposited_at',
    )
    .order('deposited_at', { ascending: false })
    .limit(500);
  if (error) throw new Error(error.message);
  return ((data ?? []) as DepositTxRow[]).map(mapRow);
}

const toPayload = (input: DepositTxInput) => ({
  customer_id: input.customerId,
  customer_name: input.customerName.trim(),
  channel: input.channel.trim() || 'Momo QR',
  code: input.code.trim(),
  message: input.message.trim(),
  amount: input.amount,
  credited: input.credited,
  bonus: input.bonus,
  fee: input.fee,
  event_name: input.eventName.trim(),
  note: input.note.trim(),
  status: input.status,
  deposited_at: input.depositedAt,
  updated_at: new Date().toISOString(),
});

export async function createDepositTransaction(input: DepositTxInput): Promise<void> {
  const { error } = await supabase.from('deposit_transactions').insert(toPayload(input));
  if (error) throw new Error(error.message);
}

export async function updateDepositTransaction(
  id: string,
  input: DepositTxInput,
): Promise<void> {
  const { error } = await supabase
    .from('deposit_transactions')
    .update(toPayload(input))
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteDepositTransaction(id: string): Promise<void> {
  const { error } = await supabase.from('deposit_transactions').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

/** Sinh mã nạp tiền ngẫu nhiên 13 chữ số, giống mã trên cổng thanh toán. */
export function suggestDepositCode(): string {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  const value = 1_000_000_000_000 + (bytes[0] % 9_000_000_000_000);
  return String(value);
}