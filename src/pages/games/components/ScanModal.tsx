import { useEffect, useMemo, useState } from 'react';
import SlotHackConsole from './SlotHackConsole';
import SlotHackResult from './SlotHackResult';
import {
  buildSlotHackScript,
  buildSlotPredictions,
  type SlotRoundPrediction,
} from './slotHackScript';
import { formatBetLevel } from '@/lib/betting';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

type ScanTarget = { name: string; kind: 'slot' | 'baccarat' } | null;

type ScanModalProps = {
  open: boolean;
  target: ScanTarget;
  onClose: () => void;
  cost: number;
  coins: number;
  onSpend: (amount: number, note: string) => Promise<boolean>;
};

type Phase = 'config' | 'running' | 'result';

const BET_OPTIONS = [10, 20, 50, 100, 200];
const ROUND_OPTIONS = [3, 5, 8, 12, 20, 30];

const rtpOf = (name: string, p: number) => {
  const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const base = Number.isFinite(p) && p > 0 ? p : 70 + (seed % 20);
  return Math.min(98, Math.max(62, Math.round(base * 0.42 + 40)));
};

export default function ScanModal({ open, target, onClose, cost, coins, onSpend }: ScanModalProps) {
  const [phase, setPhase] = useState<Phase>('config');
  const [shown, setShown] = useState(0);
  const [betLevel, setBetLevel] = useState(20);
  const [rounds, setRounds] = useState(5);
  const [busy, setBusy] = useState(false);
  useBodyScrollLock(open);

  const gameName = target?.name ?? 'Phiên phân tích';
  const code = useMemo(() => gameName.replace(/\s+/g, '-').toLowerCase(), [gameName]);
  const rtp = useMemo(() => rtpOf(gameName, 0), [gameName]);

  const lines = useMemo(
    () =>
      buildSlotHackScript({
        gameName,
        code,
        provider: target?.kind === 'baccarat' ? 'baccarat' : 'slot',
        rtp,
        rounds,
        betLevel,
      }),
    [gameName, code, target?.kind, rtp, rounds, betLevel],
  );

  const predictions: SlotRoundPrediction[] = useMemo(
    () => buildSlotPredictions(gameName, rounds, betLevel),
    [gameName, rounds, betLevel],
  );

  useEffect(() => {
    if (!open) return;
    setPhase('config');
    setShown(0);
    setBusy(false);
  }, [open, target?.name]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (phase !== 'running') return undefined;
    if (shown >= lines.length) {
      const timer = window.setTimeout(() => setPhase('result'), 520);
      return () => window.clearTimeout(timer);
    }
    const delay = lines[shown]?.kind === 'cmd' ? 230 : 72;
    const timer = window.setTimeout(() => setShown((prev) => prev + 1), delay);
    return () => window.clearTimeout(timer);
  }, [phase, shown, lines]);

  if (!open) return null;

  const progress = lines.length === 0 ? 0 : Math.round((shown / lines.length) * 100);

  const startRun = async () => {
    if (busy) return;
    setBusy(true);
    const ok = await onSpend(cost, `Phiên hack nổ hũ · ${gameName} · ${formatBetLevel(betLevel)}`);
    setBusy(false);
    if (!ok) return;
    setShown(0);
    setPhase('running');
  };

  const notEnough = coins < cost;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto px-3 py-6 md:items-center">
      <button
        type="button"
        aria-label="Đóng"
        onClick={onClose}
        className="fixed inset-0 cursor-default bg-background-50/88 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-2xl overflow-hidden rounded-lg border border-primary-500/30 bg-background-100 term-glow">
        <div className="flex items-center justify-between gap-3 border-b hairline px-4 py-2.5">
          <div className="min-w-0">
            <p className="truncate font-mono text-[10px] tracking-[0.18em] text-primary-500 uppercase">
              slot signal engine · v4.2.1
            </p>
            <p className="mt-0.5 truncate font-mono text-[9px] text-foreground-600">
              {phase === 'config'
                ? 'cấu hình phiên trước khi chạy'
                : phase === 'running'
                  ? 'đang phân tích dữ liệu phòng'
                  : 'kết quả phân tích'}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="flex items-center gap-1.5 rounded border hairline bg-background-50/70 px-2 py-1 font-mono text-[10px]">
              <i className="ri-copper-coin-line text-accent-500" />
              <span className="text-foreground-950 tabular-nums">{coins.toLocaleString('vi-VN')}</span>
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
        </div>

        <div className="p-3 md:p-4">
          {phase === 'config' && (
            <div className="space-y-3">
              <div className="rounded-md border hairline bg-background-50/60 p-3">
                <p className="truncate font-heading text-[15px] font-semibold text-foreground-950">
                  {gameName}
                </p>
                <p className="mt-0.5 font-mono text-[9px] tracking-[0.08em] text-foreground-600 uppercase">
                  phòng {code} · rtp {rtp}% ·{' '}
                  {target?.kind === 'baccarat' ? 'baccarat' : 'nổ hũ / slot'}
                </p>
              </div>

              <div>
                <p className="font-mono text-[9px] tracking-[0.16em] text-foreground-600 uppercase">
                  mức cược / vòng
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {BET_OPTIONS.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setBetLevel(level)}
                      className={`cursor-pointer rounded border px-2.5 py-1.5 font-mono text-[11px] whitespace-nowrap transition-colors ${
                        betLevel === level
                          ? 'border-primary-500/60 bg-primary-500/15 text-primary-500'
                          : 'border-background-300/50 bg-background-50/60 text-foreground-500 hover:text-foreground-950'
                      }`}
                    >
                      {formatBetLevel(level)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-mono text-[9px] tracking-[0.16em] text-foreground-600 uppercase">
                  số vòng phân tích
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {ROUND_OPTIONS.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRounds(value)}
                      className={`cursor-pointer rounded border px-2.5 py-1.5 font-mono text-[11px] whitespace-nowrap transition-colors ${
                        rounds === value
                          ? 'border-primary-500/60 bg-primary-500/15 text-primary-500'
                          : 'border-background-300/50 bg-background-50/60 text-foreground-500 hover:text-foreground-950'
                      }`}
                    >
                      {value} vòng
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 font-mono text-[9px] leading-relaxed text-foreground-600">
                  chọn từ 3 đến 30 vòng. Càng nhiều vòng, bảng kết quả càng thể hiện rõ số vòng
                  thắng và số vòng thua.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 rounded-md border hairline bg-background-50/50 p-3 font-mono text-[10px] sm:grid-cols-3">
                <p className="text-foreground-600">
                  phí phiên: <span className="text-primary-500">{cost} coin</span>
                </p>
                <p className="text-foreground-600">
                  còn lại sau khi chạy:{' '}
                  <span className="text-foreground-950">
                    {Math.max(0, coins - cost).toLocaleString('vi-VN')} coin
                  </span>
                </p>
                <p className="text-foreground-600">
                  dữ liệu: <span className="text-foreground-950">4.812 vòng</span>
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={startRun}
                  disabled={busy}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary-500 px-4 py-2.5 font-mono text-[12px] font-semibold whitespace-nowrap text-background-50 transition-colors hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <i className={busy ? 'ri-loader-4-line animate-spin' : 'ri-play-circle-line'} />
                  {busy ? 'đang trừ coin…' : `bắt đầu chạy · ${cost} coin`}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-background-300/60 px-4 py-2.5 font-mono text-[12px] whitespace-nowrap text-foreground-300 transition-colors hover:border-primary-500/50 hover:text-primary-500"
                >
                  <i className="ri-arrow-left-line" />
                  quay lại
                </button>
              </div>

              <p className="font-mono text-[9px] leading-relaxed text-foreground-600">
                {notEnough
                  ? 'Bạn không đủ coin cho phiên này — nạp thêm rồi chạy lại nhé.'
                  : `Coin được trừ ngay khi bấm chạy và được ghi vào lịch sử giao dịch. Kết quả mỗi vòng vẫn ngẫu nhiên, bảng chỉ mang tính thống kê.`}
              </p>
            </div>
          )}

          {phase === 'running' && (
            <SlotHackConsole
              gameName={gameName}
              code={code}
              provider={target?.kind === 'baccarat' ? 'baccarat' : 'slot'}
              lines={lines}
              shown={shown}
              running
              progress={progress}
              rtp={rtp}
              betLevel={betLevel}
              rounds={rounds}
            />
          )}

          {phase === 'result' && (
            <SlotHackResult
              gameName={gameName}
              code={code}
              predictions={predictions}
              coins={coins}
              cost={cost}
              busy={busy}
              onReplay={startRun}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}