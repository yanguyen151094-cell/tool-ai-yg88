import { useEffect } from 'react';
import useBodyScrollLock from '@/hooks/useBodyScrollLock';
import DepositHistoryPanel from './DepositHistoryPanel';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function DepositHistoryWindow({ open, onClose }: Props) {
  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[95] flex items-stretch justify-center overflow-hidden bg-foreground-950/75 backdrop-blur-sm sm:items-start sm:px-6 sm:py-8"
      onClick={onClose}
      role="presentation"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Lịch sử nạp tiền"
        className="light-scope deposit-window-in flex h-[100dvh] w-full flex-col overflow-hidden bg-background-50 sm:h-auto sm:max-h-[calc(100vh-4rem)] sm:max-w-4xl sm:rounded-xl sm:border sm:border-background-300"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 bg-primary-500 px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-4 sm:py-3 sm:pt-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-background-50/20 text-background-50">
              <i className="ri-history-line text-[15px]" />
            </span>
            <h2 className="truncate font-heading text-[14px] font-bold text-background-50 sm:text-[15px]">
              Lịch sử nạp tiền
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-background-50 transition-colors hover:bg-background-50/20 sm:h-8 sm:w-8"
          >
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
          <DepositHistoryPanel />
        </div>
      </div>
    </div>
  );
}