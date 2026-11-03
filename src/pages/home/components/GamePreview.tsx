import { Link } from 'react-router-dom';
import { baccaratTables, slotGames } from '@/lib/games';
import { formatStake, livePercent, liveStake, useLiveMetrics } from '@/hooks/useLiveGameMetrics';

function HeatBar({ value, tone }: { value: number; tone: 'primary' | 'accent' }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-background-300/60">
      <div
        className={`h-full rounded-full ${tone === 'primary' ? 'bg-primary-500' : 'bg-accent-500'}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export default function GamePreview() {
  const snap = useLiveMetrics();
  const tables = baccaratTables.slice(0, 2);
  const games = slotGames.slice(0, 3);

  return (
    <section className="relative border-t hairline bg-background-100/50 py-16 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-10">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-[11px] tracking-[0.22em] text-primary-500 uppercase">
              // live preview
            </p>
            <h2 className="mt-3 font-heading text-2xl font-bold text-foreground-950 md:text-4xl">
              Bàn đang mở, tín hiệu đang chạy
            </h2>
          </div>
          <Link
            to="/games"
            className="inline-flex items-center gap-2 self-start rounded-md border border-primary-500/40 px-4 py-2 font-mono text-[12px] whitespace-nowrap text-foreground-200 transition-colors hover:border-primary-500/70 hover:text-primary-500 md:self-auto"
          >
            Toàn bộ danh sách
            <i className="ri-arrow-right-line" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {tables.map((table) => (
            <article
              key={table.id}
              className="rounded-lg border hairline bg-background-50/80 p-4 md:p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.16em] text-foreground-600 uppercase">
                    baccarat · {table.round}
                  </p>
                  <h3 className="mt-1.5 font-heading text-base font-semibold text-foreground-950">
                    {table.name}
                  </h3>
                </div>
                <span className="rounded border border-primary-500/30 bg-primary-500/10 px-2 py-1 font-mono text-[10px] text-primary-500 tabular-nums">
                  {livePercent(table.code, table.confidence, snap)}%
                </span>
              </div>

              <div className="mt-4 flex items-center gap-1.5">
                {table.streak.map((item, index) => (
                  <span
                    key={`${table.id}-${index}`}
                    className={`flex h-6 w-6 items-center justify-center rounded font-mono text-[10px] font-bold ${
                      item === 'B'
                        ? 'bg-accent-500/15 text-accent-500'
                        : item === 'P'
                          ? 'bg-primary-500/15 text-primary-500'
                          : 'bg-secondary-500/20 text-secondary-500'
                    }`}
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.14em] text-foreground-600 uppercase">
                    tín hiệu
                  </p>
                  <p className="font-heading text-lg font-bold text-foreground-950">
                    {table.predict}
                  </p>
                </div>
                <p className="font-mono text-[10px] text-foreground-600">
                  {table.players} người xem
                </p>
              </div>
              <div className="mt-3">
                <HeatBar value={livePercent(table.code, table.confidence, snap)} tone="primary" />
              </div>
            </article>
          ))}

          <article className="rounded-lg border border-primary-500/25 bg-primary-500/5 p-4 md:p-5">
            <p className="font-mono text-[10px] tracking-[0.16em] text-primary-500 uppercase">
              nổ hũ · top heat
            </p>
            <div className="mt-3 space-y-3">
              {games.map((game) => {
                const heat = livePercent(game.code, game.heat, snap);
                return (
                  <div key={game.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-mono text-[11px] text-foreground-200">
                        {game.name}
                      </span>
                      <span className="font-mono text-[10px] text-primary-500 tabular-nums">
                        {heat}%
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <HeatBar value={heat} tone={heat > 80 ? 'primary' : 'accent'} />
                    </div>
                    <p className="mt-1 font-mono text-[9px] tracking-[0.1em] text-foreground-600 uppercase">
                      {game.provider} · cược {formatStake(liveStake(game.code, snap))}
                    </p>
                  </div>
                );
              })}
            </div>
            <Link
              to="/games"
              className="mt-4 flex items-center justify-center gap-2 rounded-md bg-primary-500 px-4 py-2.5 font-mono text-[12px] font-bold whitespace-nowrap text-background-50 transition-colors hover:bg-primary-400"
            >
              Mở bảng nổ hũ
              <i className="ri-arrow-right-line" />
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}