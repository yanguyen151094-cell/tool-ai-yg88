import { useEffect } from 'react';
import HackTerminal from './HackTerminal';
import type { HackLine } from './HackTerminal';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

type Props = {
  casino: string;
  room: string;
  preferred: boolean;
  winRate: number;
  lines: HackLine[];
  shown: number;
  progress: number;
  running: boolean;
  showResult: boolean;
  cost: number;
  coins: number;
  onClose: () => void;
  onReplay: () => void;
  onNewSession: () => void;
};

export default function BaccaratSessionModal({
  casino,
  room,
  preferred,
  winRate,
  lines,
  shown,
  progress,
  running,
  showResult,
  cost,
  coins,
  onClose,
  onReplay,
  onNewSession,
}: Props) {
  useBodyScrollLock(true);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const locked = showResult && !preferred;
  const notEnough = coins < cost;

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-foreground-950/80 p-2.5 backdrop-blur-sm sm:items-center sm:p-5">
      <div className="w-full max-w-3xl overflow-hidden rounded-lg border border-primary-500/25 bg-background-50">
        <div className="flex items-center justify-between gap-3 border-b hairline bg-background-100/80 px-3 py-2 md:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${
                running ? 'animate-pulse-dot bg-accent-500' : 'bg-primary-500'
              }`}
            />
            <p className="truncate font-mono text-[10px] tracking-[0.16em] text-foreground-600 uppercase">
              phiên trực tiếp · {casino ? casino.toUpperCase() : 'hidden-code'}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden font-mono text-[9px] tracking-[0.14em] whitespace-nowrap text-foreground-600 uppercase sm:inline">
              {running ? 'đang chạy' : showResult ? 'hoàn tất' : 'chờ lệnh'}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng cửa sổ phiên"
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded border border-background-300/60 text-foreground-300 transition-colors hover:border-accent-500/60 hover:text-accent-500"
            >
              <i className="ri-close-line text-[14px]" />
            </button>
          </div>
        </div>

        <div className="max-h-[86vh] overflow-y-auto p-2.5 md:p-3.5">
          <HackTerminal
            lines={lines}
            shown={shown}
            progress={progress}
            running={running}
            casino={casino}
          />

          {showResult && (
            <div
              className={`mt-3 overflow-hidden rounded-lg border p-3.5 md:p-4 ${
                locked
                  ? 'border-accent-500/40 bg-accent-500/10'
                  : 'border-primary-500/40 bg-primary-500/10'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border ${
                      locked
                        ? 'border-accent-500/40 text-accent-500'
                        : 'border-primary-500/40 text-primary-500'
                    }`}
                  >
                    <i
                      className={
                        locked ? 'ri-lock-2-line text-base' : 'ri-shield-check-line text-base'
                      }
                    />
                  </span>
                  <div className="min-w-0">
                    <p className="font-mono text-[9px] tracking-[0.18em] text-foreground-500 uppercase">
                      kết quả phiên · {casino.toUpperCase()}
                    </p>
                    <p
                      className={`mt-1 font-heading text-base font-bold md:text-lg ${
                        locked ? 'text-accent-500' : 'text-primary-500'
                      }`}
                    >
                      {locked ? 'KHÔNG THỂ XÓA MÃ ẨN' : 'ĐÃ XÓA MÃ ẨN THÀNH CÔNG'}
                    </p>
                    <p className="mt-1.5 max-w-xl font-mono text-[10px] leading-relaxed text-foreground-500">
                      {locked
                        ? `Mã ẩn của ${casino.toUpperCase()} đang bị lớp bảo vệ riêng khoá lại. Phiên chạy ở mức an toàn, tỷ lệ thắng mỗi phiên dao động dưới 30% và thay đổi theo từng lần quét.`
                        : 'Mã ẩn đã được gỡ khỏi tài khoản, tín hiệu bàn chơi đã đồng bộ với tỷ lệ thắng cao.'}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 rounded-md border border-background-300/40 bg-background-50/60 px-3.5 py-2 text-center">
                  <p className="font-mono text-[9px] tracking-[0.16em] text-foreground-600 uppercase">
                    tỷ lệ thắng
                  </p>
                  <p
                    className={`font-heading text-xl font-bold tabular-nums ${
                      locked ? 'text-accent-500' : 'text-primary-500'
                    }`}
                  >
                    {winRate}%
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 border-t hairline pt-3 sm:grid-cols-4">
                <div className="min-w-0">
                  <p className="font-mono text-[9px] tracking-[0.14em] text-foreground-600 uppercase">
                    tín hiệu
                  </p>
                  <p className="mt-1 font-mono text-[11px] font-semibold text-foreground-950">
                    {locked ? 'BANKER' : 'PLAYER'}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-[9px] tracking-[0.14em] text-foreground-600 uppercase">
                    mã ẩn
                  </p>
                  <p
                    className={`mt-1 font-mono text-[11px] font-semibold ${
                      locked ? 'text-accent-500' : 'text-primary-500'
                    }`}
                  >
                    {locked ? 'locked' : 'removed'}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-[9px] tracking-[0.14em] text-foreground-600 uppercase">
                    vòng đề xuất
                  </p>
                  <p className="mt-1 font-mono text-[11px] font-semibold text-foreground-950">
                    {locked ? '2 vòng' : '6 vòng'}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-[9px] tracking-[0.14em] text-foreground-600 uppercase">
                    bàn
                  </p>
                  <p className="mt-1 truncate font-mono text-[11px] font-semibold text-foreground-950">
                    {room.trim() ? room.trim() : 'tự chọn'}
                  </p>
                </div>
              </div>

              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-background-300/50">
                <div
                  className={`h-full rounded-full ${locked ? 'bg-accent-500' : 'bg-primary-500'}`}
                  style={{ width: `${winRate}%` }}
                />
              </div>

              <p className="mt-2.5 font-mono text-[9px] leading-relaxed text-foreground-600">
                * Kết quả thực tế mỗi ván là ngẫu nhiên. Chỉ số trên là thống kê từ dữ liệu quá khứ,
                không đảm bảo thắng. Chơi có trách nhiệm, 18+.
              </p>
            </div>
          )}

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            {showResult ? (
              <>
                <button
                  type="button"
                  onClick={onNewSession}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary-500 px-4 py-2.5 font-mono text-[11px] font-semibold whitespace-nowrap text-background-50 transition-colors hover:bg-primary-400"
                >
                  <i className="ri-refresh-line" />
                  phiên mới
                </button>
                <button
                  type="button"
                  onClick={onReplay}
                  disabled={notEnough}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-background-300/60 px-4 py-2.5 font-mono text-[11px] whitespace-nowrap text-foreground-300 transition-colors hover:border-primary-500/50 hover:text-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <i className="ri-fingerprint-line" />
                  chạy lại · {cost} coin
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-background-300/60 px-4 py-2.5 font-mono text-[11px] whitespace-nowrap text-foreground-300 transition-colors hover:border-primary-500/50 hover:text-primary-500"
              >
                <i className="ri-arrow-left-line" />
                thu nhỏ cửa sổ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}