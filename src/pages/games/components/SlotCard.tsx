import type { SlotGame } from '@/mocks/games';
import {
  formatStake,
  livePercent,
  livePlayers,
  liveStake,
  useLiveMetrics,
} from '@/hooks/useLiveGameMetrics';

type SlotCardProps = {
  game: SlotGame;
  onScan: (name: string, kind: 'slot') => void;
};

export default function SlotCard({ game, onScan }: SlotCardProps) {
  const snap = useLiveMetrics();
  const percent = livePercent(game.code, game.p, snap);
  const stake = liveStake(game.code, snap);
  const players = livePlayers(game.code, game.players, snap);

  return (
    <article className="group relative overflow-hidden rounded-md border hairline bg-background-100/70 transition-colors hover:border-primary-500/40">
      <button
        type="button"
        onClick={() => onScan(game.name, 'slot')}
        className="flex w-full cursor-pointer flex-col text-left"
        title={`Bẻ khoá ${game.name}`}
      >
        <div className="relative h-[92px] w-full overflow-hidden bg-background-200 sm:h-[104px]">
          <img
            src={game.image}
            alt={`${game.name} ${game.provider}`}
            title={`${game.name} ${game.provider} nổ hũ`}
            className="h-full w-full object-cover object-top opacity-90 transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute left-1.5 top-1.5 rounded-sm border border-primary-500/40 bg-background-50/90 px-1.5 py-0.5 font-mono text-[9px] tracking-[0.04em] whitespace-nowrap text-primary-500">
            [ {game.code} ]
          </span>
        </div>

        <div className="px-2 py-2">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] whitespace-nowrap text-foreground-600">P=</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-background-300/60">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  percent >= 85 ? 'bg-primary-500' : percent >= 65 ? 'bg-primary-400' : 'bg-accent-500'
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="w-[34px] text-right font-mono text-[10px] whitespace-nowrap text-primary-500 tabular-nums">
              {percent}%
            </span>
          </div>

          <p className="mt-1.5 truncate font-mono text-[11px] text-foreground-200 transition-colors group-hover:text-primary-500">
            <span className="text-foreground-600">› </span>
            {game.name}
          </p>
          <div className="mt-0.5 flex items-center justify-between gap-1 font-mono text-[9px] tracking-[0.06em] text-foreground-600 uppercase">
            <span className="truncate">{game.providerKey}</span>
            <span className="whitespace-nowrap text-accent-500 tabular-nums">
              cược {formatStake(stake)}
            </span>
          </div>
          <p className="mt-0.5 truncate font-mono text-[9px] tracking-[0.06em] text-foreground-600">
            {players} người đang chơi
          </p>
        </div>
      </button>
    </article>
  );
}