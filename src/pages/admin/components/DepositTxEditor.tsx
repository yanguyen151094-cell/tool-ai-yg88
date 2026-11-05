import { useEffect, useMemo, useState } from 'react';
import useBodyScrollLock from '@/hooks/useBodyScrollLock';
import {
  DEPOSIT_CHANNELS,
  DEPOSIT_STATUSES,
  DEPOSIT_STATUS_LABEL,
  suggestDepositCode,
  toDateTimeInput,
  type DepositStatus,
  type DepositTx,
  type DepositTxInput,
} from '@/lib/depositHistory';

type CustomerOption = { id: string; username: string | null };

type Props = {
  open: boolean;
  editing: DepositTx | null;
  customers: CustomerOption[];
  saving: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (input: DepositTxInput) => void;
};

const inputClass =
  'w-full rounded-md border border-background-300/50 bg-background-50/70 px-3 py-2 font-mono text-[12px] text-foreground-950 placeholder:text-foreground-600 focus:border-primary-500/60';
const labelClass =
  'mb-1 block font-mono text-[10px] tracking-[0.14em] text-foreground-600 uppercase';

const nowInput = () => toDateTimeInput(new Date().toISOString());

export default function DepositTxEditor({
  open,
  editing,
  customers,
  saving,
  error,
  onClose,
  onSubmit,
}: Props) {
  useBodyScrollLock(open);

  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [channel, setChannel] = useState(DEPOSIT_CHANNELS[0]);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState('');
  const [credited, setCredited] = useState('');
  const [bonus, setBonus] = useState('0');
  const [fee, setFee] = useState('0');
  const [eventName, setEventName] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<DepositStatus>('success');
  const [depositedAt, setDepositedAt] = useState(nowInput());
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (!open) return;
    setLocalError('');
    if (editing) {
      setCustomerId(editing.customerId ?? '');
      setCustomerName(editing.customerName);
      setChannel(editing.channel);
      setCode(editing.code);
      setMessage(editing.message);
      setAmount(String(editing.amount));
      setCredited(String(editing.credited));
      setBonus(String(editing.bonus));
      setFee(String(editing.fee));
      setEventName(editing.eventName);
      setNote(editing.note);
      setStatus(editing.status);
      setDepositedAt(toDateTimeInput(editing.depositedAt));
    } else {
      setCustomerId('');
      setCustomerName('');
      setChannel(DEPOSIT_CHANNELS[0]);
      setCode(suggestDepositCode());
      setMessage('');
      setAmount('');
      setCredited('');
      setBonus('0');
      setFee('0');
      setEventName('NẠP ĐẦU ĐÓN LỘC THƯỞNG 8888K - ND01');
      setNote('');
      setStatus('success');
      setDepositedAt(nowInput());
    }
  }, [open, editing]);

  const sortedCustomers = useMemo(
    () =>
      [...customers].sort((a, b) =>
        (a.username ?? '').localeCompare(b.username ?? '', 'vi'),
      ),
    [customers],
  );

  if (!open) return null;

  const submit = () => {
    setLocalError('');
    const amountValue = Number(amount.replace(/[^0-9.-]/g, ''));
    if (!Number.isFinite(amountValue) || amountValue < 0) {
      setLocalError('Tiền nạp phải là số không âm.');
      return;
    }
    if (!channel.trim()) {
      setLocalError('Cần chọn hoặc nhập loại tiền nạp.');
      return;
    }
    if (!depositedAt) {
      setLocalError('Cần chọn thời gian giao dịch.');
      return;
    }
    const creditedRaw = credited.trim() === '' ? amountValue : Number(credited.replace(/[^0-9.-]/g, ''));
    const bonusRaw = bonus.trim() === '' ? 0 : Number(bonus.replace(/[^0-9.-]/g, ''));
    const feeRaw = fee.trim() === '' ? 0 : Number(fee.replace(/[^0-9.-]/g, ''));

    if (!Number.isFinite(creditedRaw) || creditedRaw < 0) {
      setLocalError('Số tiền vào tài khoản không hợp lệ.');
      return;
    }

    onSubmit({
      customerId: customerId || null,
      customerName,
      channel,
      code,
      message,
      amount: amountValue,
      credited: creditedRaw,
      bonus: Number.isFinite(bonusRaw) ? bonusRaw : 0,
      fee: Number.isFinite(feeRaw) ? feeRaw : 0,
      eventName,
      note,
      status,
      depositedAt: new Date(depositedAt).toISOString(),
    });
  };

  const shownError = localError || error;

  return (
    <div className="light-scope fixed inset-0 z-[110] flex items-stretch justify-center overflow-hidden bg-foreground-950/60 backdrop-blur-sm sm:items-start sm:overflow-y-auto sm:px-6 sm:py-6">
      <div className="deposit-window-in flex h-[100dvh] w-full flex-col overflow-hidden bg-background-100 sm:h-auto sm:max-h-[calc(100vh-3rem)] sm:max-w-2xl sm:rounded-lg sm:border sm:border-background-300">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b hairline bg-primary-500 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:pt-3">
          <div className="min-w-0">
            <h3 className="truncate font-heading text-base font-bold text-background-50">
              {editing ? 'Sửa giao dịch nạp tiền' : 'Thêm giao dịch nạp tiền'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-background-50 transition-colors hover:bg-background-50/20 sm:h-8 sm:w-8"
            aria-label="Đóng"
          >
            <i className="ri-close-line text-base" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-4 sm:py-4">
          {shownError && (
            <div className="mb-3 flex items-center gap-2 rounded-md border border-accent-500/40 bg-accent-500/10 px-3 py-2">
              <i className="ri-error-warning-line text-[13px] text-accent-500" />
              <p className="font-mono text-[11px] text-accent-500">{shownError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Khách hàng</label>
              <select
                value={customerId}
                onChange={(event) => {
                  const value = event.target.value;
                  setCustomerId(value);
                  const found = sortedCustomers.find((item) => item.id === value);
                  setCustomerName(found?.username ?? '');
                }}
                className={inputClass}
              >
                <option value="">— không gắn khách —</option>
                {sortedCustomers.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.username ?? item.id.slice(0, 8)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Tên hiển thị khách</label>
              <input
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="vd: khach01"
                maxLength={60}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Loại tiền nạp</label>
              <input
                value={channel}
                onChange={(event) => setChannel(event.target.value)}
                list="deposit-channels"
                placeholder="Momo QR / LIO BANK..."
                maxLength={40}
                className={inputClass}
              />
              <datalist id="deposit-channels">
                {DEPOSIT_CHANNELS.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </div>

            <div>
              <label className={labelClass}>Mã nạp tiền</label>
              <div className="flex gap-2">
                <input
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/[^0-9a-zA-Z]/g, ''))}
                  placeholder="1711734548667"
                  maxLength={32}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setCode(suggestDepositCode())}
                  className="flex shrink-0 cursor-pointer items-center gap-1 rounded-md border border-primary-500/40 px-2.5 py-2 font-mono text-[10px] whitespace-nowrap text-primary-500 transition-colors hover:bg-primary-500/10"
                >
                  <i className="ri-magic-line" />
                  tạo
                </button>
              </div>
            </div>

            <div>
              <label className={labelClass}>Trạng thái</label>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as DepositStatus)}
                className={inputClass}
              >
                {DEPOSIT_STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {DEPOSIT_STATUS_LABEL[item]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Thời gian giao dịch</label>
              <input
                type="datetime-local"
                value={depositedAt}
                onChange={(event) => setDepositedAt(event.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Tiền nạp</label>
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                inputMode="decimal"
                placeholder="300.00"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Số tiền vào tài khoản</label>
              <input
                value={credited}
                onChange={(event) => setCredited(event.target.value)}
                inputMode="decimal"
                placeholder="để trống = bằng tiền nạp"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Số tiền tăng</label>
              <input
                value={bonus}
                onChange={(event) => setBonus(event.target.value)}
                inputMode="decimal"
                placeholder="0.00"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Phí thủ tục</label>
              <input
                value={fee}
                onChange={(event) => setFee(event.target.value)}
                inputMode="decimal"
                placeholder="0.00"
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Sự kiện</label>
              <input
                value={eventName}
                onChange={(event) => setEventName(event.target.value)}
                placeholder="NẠP ĐẦU ĐÓN LỘC THƯỞNG 8888K - ND01"
                maxLength={120}
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Lời nhắn</label>
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="nội dung chuyển khoản"
                maxLength={120}
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Ghi chú</label>
              <input
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="ghi chú nội bộ"
                maxLength={160}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 border-t hairline px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-end sm:pb-3">
          <p className="min-w-0 flex-1 font-mono text-[9px] leading-relaxed text-foreground-600">
            Giao dịch ở đây chỉ ghi nhận lịch sử, không tự cộng coin cho khách.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full cursor-pointer rounded-md border hairline px-3.5 py-2.5 font-mono text-[11px] whitespace-nowrap text-foreground-400 transition-colors hover:text-foreground-950 sm:w-auto sm:py-2"
          >
            hủy
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={submit}
            className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md bg-primary-500 px-4 py-2.5 text-[11px] font-bold whitespace-nowrap text-background-50 transition-colors hover:bg-primary-600 disabled:opacity-60 sm:w-auto sm:py-2"
          >
            <i className={saving ? 'ri-loader-4-line animate-spin' : 'ri-save-3-line'} />
            {editing ? 'lưu thay đổi' : 'thêm giao dịch'}
          </button>
        </div>
      </div>
    </div>
  );
}