import type { SlotGame } from '@/mocks/games';
import { formatStake, livePercent, liveStake, useLiveMetrics } from '@/hooks/useLiveGameMetrics';

type Props = {
  game: SlotGame;
  onRemove: () => void;
};

export default function CompareRow({ game, onRemove }: Props) {
  const snap = useLiveMetrics();
  const percent = livePercent(game.code, game.p, snap);
  const stake = liveStake(game.code, snap);

  return (
    <div className="flex items-center gap-2 rounded border hairline bg-background-50/70 px-2 py-1.5">
      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-[10px] text-foreground-200">{game.name}</p>
        <p className="mt-0.5 truncate font-mono text-[9px] tracking-[0.06em] text-foreground-600 uppercase">
          cược {formatStake(stake)}
        </p>
        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-background-300/60">
          <div
            className="h-full rounded-full bg-primary-500 transition-all duration-700"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      <span className="w-[32px] text-right font-mono text-[11px] text-primary-500 tabular-nums">
        {percent}%
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-foreground-600 transition-colors hover:text-accent-500"
        aria-label={`Bỏ ${game.name}`}
      >
        <i className="ri-close-line text-[13px]" />
      </button>
    </div>
  );
}