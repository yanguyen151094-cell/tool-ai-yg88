import { useMemo } from 'react';
import { useLiveWins } from '@/hooks/useLiveWins';
import type { LiveGameRef } from '@/hooks/useLiveWins';
import { baccaratTables, slotGames } from '@/lib/games';

type LiveWinFeedProps = {
  kind: 'slot' | 'baccarat';
  gameName: string;
  image: string;
  code: string;
};

const formatVnd = (value: number) => `${value.toLocaleString('vi-VN')}₫`;

export default function LiveWinFeed({ kind, gameName, image, code }: LiveWinFeedProps) {
  const catalog = useMemo<LiveGameRef[]>(() => {
    if (kind === 'baccarat') {
      return baccaratTables.map((table) => ({
        name: table.name,
        image: table.image,
        code: table.code,
      }));
    }
    return slotGames.map((game) => ({
      name: game.name,
      image: game.image,
      code: game.code,
    }));
  }, [kind]);

  const current = useMemo<LiveGameRef>(
    () => ({ name: gameName, image, code }),
    [gameName, image, code],
  );

  const wins = useLiveWins(current, catalog);

  return (
    <section className="overflow-hidden rounded-lg border border-primary-500/25 bg-background-100/70">
      <div className="flex items-center justify-between gap-3 border-b hairline bg-background-100/80 px-3 py-2.5">
        <p className="truncate font-mono text-[10px] tracking-[0.16em] text-foreground-500 uppercase">
          trúng thưởng · live
        </p>
        <div className="flex shrink-0 items-center gap-3 font-mono text-[10px]">
          <span className="hidden items-center gap-1 text-foreground-600 sm:flex">
            <i className="ri-user-voice-line text-[11px] text-foreground-500" />
            {wins.length} tk đang nổ
          </span>
          <span className="flex items-center gap-1.5 text-primary-500">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-primary-500" />
            live
          </span>
        </div>
      </div>

      <div className="max-h-[340px] overflow-y-auto">
        {wins.map((win) => (
          <div
            key={win.id}
            className="flex animate-live-in items-center gap-2.5 border-b border-background-200/40 px-2.5 py-2 last:border-b-0"
          >
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md border hairline bg-background-200">
              <img
                src={win.image}
                alt={`${win.game} nổ hũ`}
                title={`${win.game} - ${win.code}`}
                className="h-full w-full object-cover object-top"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-[11px] leading-tight text-foreground-950">
                <span className="font-semibold">{win.name}</span>
                <span className="ml-1.5 text-[9px] font-normal text-foreground-600">{win.ago}</span>
              </p>
              <p className="mt-0.5 truncate font-mono text-[9px] leading-tight text-foreground-600">
                {win.game}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className="font-mono text-[11px] font-semibold whitespace-nowrap text-primary-500">
                +{formatVnd(win.amount)}
              </p>
              <p className="mt-0.5 font-mono text-[9px] whitespace-nowrap text-foreground-600">
                {win.times} lần
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5 border-t hairline bg-background-50/60 px-3 py-1.5">
        <span className="h-1 w-1 animate-pulse-dot rounded-full bg-accent-500" />
        <p className="font-mono text-[9px] text-foreground-600">
          luồng dữ liệu tự động · cập nhật mỗi vài giây
        </p>
      </div>
    </section>
  );
}