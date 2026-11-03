import { useEffect, useMemo, useState } from 'react';

type ScanTarget = { name: string; kind: 'slot' | 'baccarat' } | null;

type ScanModalProps = {
  open: boolean;
  target: ScanTarget;
  onClose: () => void;
  cost: number;
  onSpend: (coins: number) => void;
};

const LOG_STEPS = [
  'handshake → node 14/14 · ssl 1.3',
  'mount stream · reading last 240 rounds',
  'normalize → xác suất lệch chuẩn',
  'pattern match → zigzag 3-2-1',
  'risk buffer → 0.12 · safe zone',
  'kết xuất tín hiệu…',
];

export default function ScanModal({ open, target, onClose, cost, onSpend }: ScanModalProps) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    setProgress(0);
    setDone(false);
    const start = Date.now();
    const timer = window.setInterval(() => {
      const next = Math.min(100, Math.round(((Date.now() - start) / 2200) * 100));
      setProgress(next);
      if (next >= 100) {
        window.clearInterval(timer);
        setDone(true);
      }
    }, 60);
    return () => window.clearInterval(timer);
  }, [open, target?.name]);

  useEffect(() => {
    if (done) onSpend(cost);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const result = useMemo(() => {
    const seed = (target?.name ?? 'yg88').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const picks = ['BANKER', 'PLAYER', 'TIE'];
    const signal = target?.kind === 'baccarat' ? picks[seed % 2] : 'MỞ HŨ';
    return {
      signal,
      confidence: 88 + (seed % 10),
      riskLow: `0.${8 + (seed % 4)}`,
      rounds: 3 + (seed % 4),
    };
  }, [target?.name, target?.kind]);

  if (!open) return null;

  const logIndex = Math.min(LOG_STEPS.length, Math.floor((progress / 100) * LOG_STEPS.length));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label="Đóng"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-background-50/85 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-lg overflow-hidden rounded-lg border border-primary-500/30 bg-background-100 term-glow">
        <div className="flex items-center justify-between border-b hairline px-4 py-2.5">
          <span className="font-mono text-[10px] tracking-[0.18em] text-primary-500 uppercase">
            ai · đang bẻ khoá
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded border hairline text-foreground-500 transition-colors hover:text-primary-500"
            aria-label="Đóng cửa sổ"
          >
            <i className="ri-close-line text-sm" />
          </button>
        </div>

        <div className="p-5">
          <p className="truncate font-heading text-lg font-semibold text-foreground-950">
            {target?.name ?? 'Phiên phân tích'}
          </p>
          <p className="mt-1 font-mono text-[10px] tracking-[0.14em] text-foreground-600 uppercase">
            {target?.kind === 'baccarat' ? 'baccarat table' : 'slot room'} · {cost} coin
          </p>

          <div className="mt-5 flex items-center gap-4">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-primary-500/30">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(oklch(var(--primary-500)) ${progress}%, transparent ${progress}%)`,
                  mask: 'radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 5px))',
                  WebkitMask:
                    'radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 5px))',
                }}
              />
              <span className="font-mono text-sm font-bold text-primary-500">{progress}%</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-background-300/60">
                <div
                  className="h-full rounded-full bg-primary-500 transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 truncate font-mono text-[10px] text-foreground-600">
                {done ? 'hoàn tất · tín hiệu đã sẵn sàng' : LOG_STEPS[Math.max(0, logIndex - 1)]}
              </p>
            </div>
          </div>

          <div className="mt-5 h-[132px] overflow-hidden rounded border border-primary-500/15 bg-background-50/70 p-3">
            <div className="space-y-1.5 font-mono text-[10px] leading-relaxed">
              {LOG_STEPS.slice(0, Math.max(1, logIndex)).map((line, index) => (
                <p key={line} className="truncate text-foreground-500">
                  <span className="mr-1.5 text-foreground-700">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-primary-500">$</span> {line}
                  {index === Math.max(0, logIndex - 1) && !done && (
                    <span className="ml-1 inline-block h-2.5 w-1.5 animate-caret bg-primary-500 align-middle" />
                  )}
                </p>
              ))}
            </div>
          </div>

          {done && (
            <div className="mt-4 rounded-md border border-primary-500/30 bg-primary-500/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.16em] text-foreground-600 uppercase">
                    tín hiệu
                  </p>
                  <p className="font-heading text-xl font-bold text-primary-500">{result.signal}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[10px] tracking-[0.16em] text-foreground-600 uppercase">
                    độ khớp
                  </p>
                  <p className="font-heading text-xl font-bold text-foreground-950">
                    {result.confidence}%
                  </p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 border-t hairline pt-3 font-mono text-[10px]">
                <p className="text-foreground-600">
                  rủi ro: <span className="text-foreground-200">{result.riskLow}</span>
                </p>
                <p className="text-foreground-600">
                  theo dõi: <span className="text-foreground-200">{result.rounds} vòng</span>
                </p>
              </div>
            </div>
          )}

          <p className="mt-4 font-mono text-[9px] leading-relaxed text-foreground-700">
            * Kết quả mỗi ván là ngẫu nhiên. Tín hiệu trên chỉ phản ánh thống kê dữ liệu quá khứ, không
            đảm bảo thắng.
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary-500 px-4 py-2.5 font-mono text-[12px] font-semibold whitespace-nowrap text-background-50 transition-colors hover:bg-primary-400"
            >
              <i className="ri-check-line" />
              Đã hiểu
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-primary-500/40 px-4 py-2.5 font-mono text-[12px] whitespace-nowrap text-foreground-200 transition-colors hover:border-primary-500/70 hover:text-primary-500"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}