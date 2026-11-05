import { useState } from 'react';
import {
  DEPOSIT_STATUS_LABEL,
  depositDateTime,
  depositMoney,
  type DepositTx,
} from '@/lib/depositHistory';

type Props = {
  item: DepositTx;
  onEdit: () => void;
  onDelete: () => void;
  deleting?: boolean;
};

const moneyTone = 'text-accent-600';
const labelTone = 'text-foreground-600';

export default function DepositTxCard({ item, onEdit, onDelete, deleting }: Props) {
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const copyCode = async () => {
    if (!item.code) return;
    try {
      await navigator.clipboard.writeText(item.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const statusTone =
    item.status === 'success'
      ? 'text-primary-500'
      : item.status === 'pending'
        ? 'text-secondary-500'
        : 'text-accent-500';

  return (
    <article className="border-b hairline px-3 py-3.5 last:border-0 sm:px-4 sm:py-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-heading text-[14px] font-semibold text-foreground-950">
            {item.channel}
            {item.customerName && (
              <span className="rounded border border-secondary-500/30 bg-secondary-500/10 px-1.5 py-0.5 font-mono text-[9px] font-normal tracking-[0.08em] text-secondary-500 uppercase">
                {item.customerName}
              </span>
            )}
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-foreground-600">
            {depositDateTime(item.depositedAt)}
          </p>
        </div>

        <div className="flex w-full shrink-0 items-center gap-1.5 sm:w-auto">
          <button
            type="button"
            onClick={onEdit}
            className="flex flex-1 cursor-pointer items-center justify-center gap-1 rounded border border-primary-500/40 px-2.5 py-2 font-mono text-[10px] whitespace-nowrap text-primary-500 transition-colors hover:bg-primary-500/10 sm:flex-none sm:py-1.5"
          >
            <i className="ri-edit-line" />
            sửa
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete((prev) => !prev)}
            className="flex flex-1 cursor-pointer items-center justify-center gap-1 rounded border border-accent-500/40 px-2.5 py-2 font-mono text-[10px] whitespace-nowrap text-accent-500 transition-colors hover:bg-accent-500/10 sm:flex-none sm:py-1.5"
          >
            <i className="ri-delete-bin-6-line" />
            xóa
          </button>
        </div>
      </div>

      <div className="mt-3 rounded-md border border-background-300 bg-background-100 p-2.5 sm:p-3">
        <div className="space-y-1.5">
          <div className="flex flex-row items-center gap-2 sm:flex-wrap">
            <span className={`w-[92px] shrink-0 sm:w-[112px] font-mono text-[11px] ${labelTone}`}>Mã nạp tiền:</span>
            <span className="font-mono text-[12px] text-foreground-950">{item.code || '—'}</span>
            {item.code && (
              <button
                type="button"
                onClick={copyCode}
                aria-label="Chép mã nạp tiền"
                className="flex h-6 w-6 cursor-pointer items-center justify-center rounded border border-background-300 text-foreground-500 transition-colors hover:border-primary-500/50 hover:text-primary-500"
              >
                <i className={copied ? 'ri-check-line text-[12px]' : 'ri-file-copy-line text-[12px]'} />
              </button>
            )}
          </div>
          <p className="flex flex-col gap-0.5 font-mono text-[11px] sm:flex-row sm:flex-wrap sm:gap-2">
            <span className={`w-[92px] shrink-0 sm:w-[112px] ${labelTone}`}>Lời nhắn:</span>
            <span className="min-w-0 flex-1 break-words text-foreground-950">
              {item.message || '—'}
            </span>
          </p>
          <p className="flex flex-col gap-0.5 font-mono text-[11px] sm:flex-row sm:flex-wrap sm:gap-2">
            <span className={`w-[92px] shrink-0 sm:w-[112px] ${labelTone}`}>Thời gian:</span>
            <span className="text-foreground-950">{depositDateTime(item.depositedAt)}</span>
          </p>
          <p className="flex flex-col gap-0.5 font-mono text-[11px] sm:flex-row sm:flex-wrap sm:gap-2">
            <span className={`w-[92px] shrink-0 sm:w-[112px] ${labelTone}`}>Phí thủ tục:</span>
            <span className="text-foreground-950">{depositMoney(item.fee)}</span>
          </p>
          <p className="flex flex-col gap-0.5 font-mono text-[11px] sm:flex-row sm:flex-wrap sm:gap-2">
            <span className={`w-[92px] shrink-0 sm:w-[112px] ${labelTone}`}>Sự kiện:</span>
            <span className="min-w-0 flex-1 break-words text-foreground-950">
              {item.eventName || '—'}
            </span>
          </p>
          <p className="flex flex-col gap-0.5 font-mono text-[11px] sm:flex-row sm:flex-wrap sm:gap-2">
            <span className={`w-[92px] shrink-0 sm:w-[112px] ${labelTone}`}>Ghi chú:</span>
            <span className="min-w-0 flex-1 break-words text-foreground-950">{item.note || '—'}</span>
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2.5 border-t hairline pt-3 sm:grid-cols-4 sm:gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.08em] text-foreground-600">Tiền nạp</p>
          <p className={`mt-0.5 font-mono text-[13px] font-bold ${moneyTone}`}>
            {depositMoney(item.amount)}
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] tracking-[0.08em] text-foreground-600">
            Số tiền vào tài khoản
          </p>
          <p className="mt-0.5 font-mono text-[13px] text-foreground-950">
            {depositMoney(item.credited)}
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] tracking-[0.08em] text-foreground-600">Số tiền tăng</p>
          <p className="mt-0.5 font-mono text-[13px] text-foreground-950">
            {depositMoney(item.bonus)}
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] tracking-[0.08em] text-foreground-600">Trạng thái</p>
          <p className={`mt-0.5 font-mono text-[13px] font-semibold ${statusTone}`}>
            {DEPOSIT_STATUS_LABEL[item.status]}
          </p>
        </div>
      </div>

      {confirmDelete && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md border border-accent-500/40 bg-accent-500/10 px-3 py-2">
          <p className="min-w-0 flex-1 font-mono text-[11px] leading-relaxed text-accent-500">
            Xóa giao dịch {item.code || 'này'}? Không khôi phục được.
          </p>
          <button
            type="button"
            disabled={deleting}
            onClick={onDelete}
            className="cursor-pointer rounded-md border border-accent-500/60 px-3 py-1.5 font-mono text-[10px] font-bold whitespace-nowrap text-accent-500 transition-colors hover:bg-accent-500/10 disabled:opacity-60"
          >
            {deleting ? 'đang xóa...' : 'xác nhận xóa'}
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            className="cursor-pointer rounded-md border hairline px-3 py-1.5 font-mono text-[10px] whitespace-nowrap text-foreground-400 transition-colors hover:text-foreground-950"
          >
            hủy
          </button>
        </div>
      )}
    </article>
  );
}