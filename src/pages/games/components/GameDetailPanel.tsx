import { useEffect } from 'react';
import TermWindow from '@/components/base/TermWindow';
import LiveWinFeed from './LiveWinFeed';
import {
  formatBetRange,
  livePercent,
  liveStake,
  useLiveMetrics,
} from '@/hooks/useLiveGameMetrics';

type GameDetailPanelProps = {
  open: boolean;
  kind: 'slot' | 'baccarat';
  name: string;
  code: string;
  image: string;
  provider: string;
  meta: string;
  p: number;
  coins: number;
  hackCost: number;
  onClose: () => void;
  onHack: () => void;
};

export default function GameDetailPanel({
  open,
  kind,
  name,
  code,
  image,
  provider,
  meta,
  p,
  coins,
  hackCost,
  onClose,
  onHack,
}: GameDetailPanelProps) {
  const snap = useLiveMetrics();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  const percent = livePercent(code, p, snap);
  const liveBet = formatBetRange(liveStake(code, snap));
  const hitRate = Math.round(percent * 0.42 * 10) / 10;
  const avgMultiplier = Math.round((percent / 3 + 3) * 10) / 10;
  const volatility = percent >= 80 ? 'Thấp' : percent >= 65 ? 'Trung bình' : 'Cao';

  const stats = [
    { label: 'rtp', value: `${percent}%`, tone: 'text-primary-500' },
    { label: 'hit 1h', value: `${hitRate}%`, tone: 'text-foreground-950' },
    { label: 'bội tb', value: `×${avgMultiplier}`, tone: 'text-foreground-950' },
    { label: 'biến động', value: volatility, tone: 'text-accent-500' },
  ];

  return (
    <div className="fixed inset-0 z-[55] overflow-y-auto">
      <button
        type="button"
        aria-label="Đóng chi tiết phòng"
        onClick={onClose}
        className="fixed inset-0 cursor-default bg-background-50/92 backdrop-blur-sm"
      />

      <div className="relative mx-auto w-full max-w-xl px-3 py-4 sm:py-8">
        <div className="mb-2.5 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="font-mono text-[10px] tracking-[0.16em] text-primary-500 uppercase">
              $ phòng
            </span>
            <span className="truncate font-mono text-[10px] text-foreground-600">{code}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex items-center gap-1.5 rounded border hairline bg-background-100/70 px-2 py-1 font-mono text-[10px]">
              <i className="ri-copper-coin-line text-accent-500" />
              <span className="text-foreground-950">{coins.toLocaleString('vi-VN')}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded border hairline text-foreground-500 transition-colors hover:text-primary-500"
              aria-label="Đóng"
            >
              <i className="ri-close-line text-sm" />
            </button>
          </div>
        </div>

        <TermWindow title="root@ai/slot/predict$ run --target" bodyClassName="p-3">
          <div className="flex items-start gap-2.5">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border hairline bg-background-200">
              <img
                src={image}
                alt={`${name} ${provider}`}
                title={`${name} ${provider} - TOOL AI YG88`}
                className="h-full w-full object-cover object-top"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-heading text-[15px] font-semibold text-foreground-950">
                {name}
              </p>
              <p className="mt-0.5 truncate font-mono text-[9px] tracking-[0.06em] text-foreground-600">
                {kind === 'baccarat' ? `# ${provider.toUpperCase()} · ${meta}` : meta}
              </p>
            </div>
            <span className="flex shrink-0 items-center gap-1.5 rounded border border-primary-500/40 bg-primary-500/10 px-1.5 py-1 font-mono text-[9px] tracking-[0.14em] text-primary-500 uppercase">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-primary-500" />
              live
            </span>
          </div>

          <div className="relative mt-3 overflow-hidden rounded-md border hairline bg-background-50/80 px-3 py-6 text-center">
            <div className="pointer-events-none absolute inset-0 opacity-40 blur-[10px]">
              <div className="absolute left-2 top-2 h-6 w-14 rounded bg-accent-500/40" />
              <div className="absolute left-16 top-4 h-5 w-10 rounded bg-primary-500/50" />
              <div className="absolute right-4 top-3 h-7 w-12 rounded bg-primary-500/40" />
              <div className="absolute bottom-2 left-6 h-5 w-16 rounded bg-secondary-500/40" />
              <div className="absolute bottom-3 right-8 h-6 w-14 rounded bg-accent-500/30" />
            </div>

            <div className="relative">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-primary-500/40 bg-background-100/80">
                <i className="ri-lock-2-line text-base text-primary-500" />
              </div>
              <p className="mt-2.5 font-mono text-[10px] tracking-[0.14em] text-primary-500 uppercase">
                dữ liệu ai đã mã hoá
              </p>
              <p className="mt-1 font-mono text-[9px] tracking-[0.12em] text-foreground-600 uppercase">
                cần phá khoá để xem tín hiệu
              </p>
              <button
                type="button"
                onClick={onHack}
                className="mt-3.5 inline-flex cursor-pointer items-center gap-2 rounded border border-primary-500/60 bg-primary-500/10 px-4 py-2 font-mono text-[11px] font-semibold tracking-[0.14em] whitespace-nowrap text-primary-500 uppercase transition-colors hover:bg-primary-500 hover:text-background-50"
              >
                <span className="text-foreground-500">[</span>
                hack {hackCost}
                <i className="ri-copper-coin-line text-[11px]" />
                <span className="text-foreground-500">]</span>
              </button>
            </div>
          </div>
        </TermWindow>

        <div className="mt-2.5">
          <TermWindow title="root@ai/slot/predict$ heatmap --window=1h" bodyClassName="px-3 py-4">
            <div className="flex items-center justify-center gap-3">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-background-200/80">
                <div className="h-full w-1/3 rounded-full bg-primary-500/20 blur-[2px]" />
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary-500/40 bg-background-100/70">
                <i className="ri-lock-2-line text-sm text-primary-500" />
              </div>
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-background-200/80">
                <div className="ml-auto h-full w-1/4 rounded-full bg-accent-500/20 blur-[2px]" />
              </div>
            </div>
          </TermWindow>
        </div>

        <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-md border hairline bg-background-100/60 px-2.5 py-2"
            >
              <p className="truncate font-mono text-[9px] tracking-[0.1em] text-foreground-600 uppercase">
                <span className="mr-1 text-foreground-500">$</span>
                {item.label}
              </p>
              <p className={`mt-1 truncate font-mono text-[13px] font-semibold ${item.tone}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-md border border-primary-500/25 bg-primary-500/5 px-3 py-2">
          <span className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.14em] text-primary-500 uppercase">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-primary-500" />
            tỷ lệ & cược đang chạy
          </span>
          <span className="font-mono text-[10px] text-foreground-500">
            cập nhật mỗi 3 phút · <span className="text-accent-500 tabular-nums">{liveBet}</span>
          </span>
        </div>

        <div className="mt-2.5">
          <LiveWinFeed kind={kind} gameName={name} image={image} code={code} />
        </div>
        <div className="mt-2.5 flex items-start gap-2 rounded-md border hairline bg-background-100/40 px-3 py-2.5">
          <i className="ri-error-warning-line mt-0.5 text-[13px] text-accent-500" />
          <p className="font-mono text-[9px] leading-relaxed text-foreground-600">
            Bảng trúng thưởng là dữ liệu tham khảo được cập nhật liên tục, không phải lời mời đặt cược và
            không đảm bảo kết quả cho ván tiếp theo.
          </p>
        </div>
      </div>
    </div>
  );
}