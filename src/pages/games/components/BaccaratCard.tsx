import type { BaccaratTable } from '@/mocks/games';
import {
  formatBetRange,
  livePercent,
  livePlayers,
  liveStake,
  useLiveMetrics,
} from '@/hooks/useLiveGameMetrics';

type Props = {
  table: BaccaratTable;
  onScan: (name: string, kind: 'baccarat') => void;
};

export default function BaccaratCard({ table, onScan }: Props) {
  const snap = useLiveMetrics();
  const confidence = livePercent(table.code, table.confidence, snap);
  const limit = formatBetRange(liveStake(table.code, snap));
  const players = livePlayers(table.code, table.players, snap);

  const predictTone =
    table.predict === 'BANKER'
      ? 'text-accent-500 border-accent-500/40 bg-accent-500/10'
      : table.predict === 'PLAYER'
        ? 'text-primary-500 border-primary-500/40 bg-primary-500/10'
        : 'text-secondary-500 border-secondary-500/40 bg-secondary-500/10';

  return (
    <article className="group overflow-hidden rounded-lg border hairline bg-background-100/50 transition-colors hover:border-primary-500/40">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-background-200">
        <img
          src={table.image}
          alt={`${table.name} - ${table.dealer}`}
          title={`${table.name} ${table.dealer} - TOOL AI YG88`}
          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background-50 via-background-50/10 to-transparent" />

        <span className="absolute left-2 top-2 flex items-center gap-1.5 rounded border hairline bg-background-50/80 px-2 py-1 font-mono text-[9px] whitespace-nowrap backdrop-blur-sm">
          <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-accent-500" />
          <span className="tracking-[0.14em] text-foreground-400 uppercase">live</span>
        </span>
        <span
          className={`absolute right-2 top-2 rounded border px-2 py-1 font-mono text-[9px] whitespace-nowrap backdrop-blur-sm ${predictTone}`}
        >
          {table.predict}
        </span>

        <div className="absolute inset-x-2 bottom-2 flex flex-wrap items-center gap-1">
          {table.streak.map((item, index) => (
            <span
              key={`${table.id}-streak-${index}`}
              className={`flex h-5 w-5 items-center justify-center rounded font-mono text-[9px] font-bold ${
                item === 'B'
                  ? 'bg-accent-500/20 text-accent-500'
                  : item === 'P'
                    ? 'bg-primary-500/20 text-primary-500'
                    : 'bg-secondary-500/25 text-secondary-500'
              }`}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="p-4">
        <h3 className="truncate font-heading text-base font-semibold text-foreground-950">
          {table.name}
        </h3>
        <p className="mt-1 truncate font-mono text-[10px] text-foreground-600">
          {table.round} · {table.dealer}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2 border-t hairline pt-3 font-mono text-[10px]">
          <div>
            <p className="text-foreground-600 uppercase">độ khớp</p>
            <p className="mt-1 text-sm font-semibold text-primary-500 tabular-nums transition-all duration-700">
              {confidence}%
            </p>
          </div>
          <div>
            <p className="text-foreground-600 uppercase">giới hạn</p>
            <p className="mt-1 truncate text-sm font-semibold text-accent-500 tabular-nums">
              {limit}
            </p>
          </div>
          <div>
            <p className="text-foreground-600 uppercase">đang xem</p>
            <p className="mt-1 text-sm font-semibold text-foreground-950 tabular-nums">{players}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onScan(table.name, 'baccarat')}
          className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-primary-500/50 bg-primary-500/10 px-4 py-2 font-mono text-[11px] font-semibold whitespace-nowrap text-primary-500 transition-colors hover:bg-primary-500 hover:text-background-50"
        >
          <i className="ri-fingerprint-line text-sm" />
          BẺ KHOÁ BÀN NÀY
        </button>
      </div>
    </article>
  );
}