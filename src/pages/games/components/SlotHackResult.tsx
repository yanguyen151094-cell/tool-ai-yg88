import { formatBetLevel } from '@/lib/betting';
import type { SlotRoundPrediction } from './slotHackScript';

type Props = {
  gameName: string;
  code: string;
  predictions: SlotRoundPrediction[];
  coins: number;
  cost: number;
  busy: boolean;
  onReplay: () => void;
  onClose: () => void;
};

export default function SlotHackResult({
  gameName,
  code,
  predictions,
  coins,
  cost,
  busy,
  onReplay,
  onClose,
}: Props) {
  const avgConfidence =
    predictions.length === 0
      ? 0
      : Math.round(predictions.reduce((sum, item) => sum + item.confidence, 0) / predictions.length);
  const bankroll = predictions.reduce((sum, item) => sum + item.bet, 0);
  const hotRounds = predictions.filter((item) => item.signal.includes('MỞ HŨ')).length;

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: 'độ khớp tb', value: `${avgConfidence}%`, tone: 'text-primary-500' },
          { label: 'vòng nổ hũ', value: `${hotRounds}/${predictions.length}`, tone: 'text-foreground-950' },
          { label: 'vốn gợi ý', value: formatBetLevel(bankroll), tone: 'text-accent-500' },
          { label: 'coin còn lại', value: coins.toLocaleString('vi-VN'), tone: 'text-foreground-950' },
        ].map((item) => (
          <div key={item.label} className="rounded-md border hairline bg-background-100/70 px-2.5 py-2">
            <p className="truncate font-mono text-[8px] tracking-[0.12em] text-foreground-600 uppercase">
              {item.label}
            </p>
            <p className={`mt-0.5 truncate font-mono text-[13px] font-bold tabular-nums ${item.tone}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-md border hairline">
        <div className="flex items-center justify-between gap-2 border-b hairline bg-background-50/70 px-3 py-2">
          <p className="truncate font-mono text-[9px] tracking-[0.14em] text-primary-500 uppercase">
            bảng tín hiệu · {code || 'room'}
          </p>
          <p className="shrink-0 font-mono text-[9px] text-foreground-600">tự cập nhật mỗi 3 phút</p>
        </div>

        <div className="hidden border-b hairline bg-background-50/40 px-3 py-1.5 font-mono text-[9px] tracking-[0.1em] text-foreground-600 uppercase sm:grid sm:grid-cols-[52px_1fr_70px_90px_78px] sm:gap-2">
          <span>vòng</span>
          <span>tín hiệu</span>
          <span>bội</span>
          <span>độ khớp</span>
          <span className="text-right">cược</span>
        </div>

        <div className="divide-y divide-primary-500/10">
          {predictions.map((item) => (
            <div
              key={item.round}
              className="grid grid-cols-[44px_1fr_74px] items-center gap-2 px-3 py-2 sm:grid-cols-[52px_1fr_70px_90px_78px]"
            >
              <span className="font-mono text-[10px] text-foreground-600 tabular-nums">
                #{String(item.round).padStart(2, '0')}
              </span>
              <span className="min-w-0">
                <span
                  className={`block truncate font-mono text-[11px] font-semibold ${
                    item.signal.includes('MỞ HŨ') ? 'text-primary-500' : 'text-foreground-200'
                  }`}
                >
                  {item.signal}
                </span>
                <span className="block truncate font-mono text-[9px] text-foreground-600">
                  {item.note}
                </span>
              </span>
              <span className="font-mono text-[10px] text-accent-500 tabular-nums">
                ×{item.multiplier}
              </span>
              <span className="hidden items-center gap-1.5 sm:flex">
                <span className="h-1 flex-1 overflow-hidden rounded-full bg-background-300/60">
                  <span
                    className="block h-full rounded-full bg-primary-500"
                    style={{ width: `${item.confidence}%` }}
                  />
                </span>
                <span className="w-7 shrink-0 text-right font-mono text-[9px] text-foreground-500 tabular-nums">
                  {item.confidence}%
                </span>
              </span>
              <span className="text-right font-mono text-[10px] text-foreground-950 tabular-nums">
                {formatBetLevel(item.bet)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-md border border-accent-500/25 bg-accent-500/5 px-3 py-2">
        <i className="ri-information-line mt-0.5 text-[12px] text-accent-500" />
        <p className="font-mono text-[9px] leading-relaxed text-foreground-500">
          {gameName} · bảng trên là thống kê từ dữ liệu quá khứ, mỗi vòng quay vẫn ngẫu nhiên. Hãy tự
          quyết định mức cược và chơi có trách nhiệm.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onReplay}
          disabled={busy}
          className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary-500 px-4 py-2.5 font-mono text-[12px] font-semibold whitespace-nowrap text-background-50 transition-colors hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <i className={`${busy ? 'ri-loader-4-line animate-spin' : 'ri-restart-line'}`} />
          {busy ? 'đang trừ coin…' : `chạy lại · ${cost} coin`}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-background-300/60 px-4 py-2.5 font-mono text-[12px] whitespace-nowrap text-foreground-300 transition-colors hover:border-primary-500/50 hover:text-primary-500"
        >
          <i className="ri-close-line" />
          đóng cửa sổ
        </button>
      </div>
    </div>
  );
}