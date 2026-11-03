import { Link as RouterLink } from 'react-router-dom';

type WinTickerProps = {
  items: { user: string; amount: string; table: string }[];
  variant?: 'hero' | 'bar';
  speed?: 'normal' | 'slow';
};

export default function WinTicker({ items, variant = 'bar', speed = 'normal' }: WinTickerProps) {
  const doubled = [...items, ...items];
  const isHero = variant === 'hero';

  return (
    <div className={`ticker-mask relative w-full overflow-hidden ${isHero ? 'py-1' : 'py-2'}`}>
      <div
        className={`flex w-max items-center ${
          speed === 'slow' ? 'animate-ticker-slow' : 'animate-ticker'
        } ${isHero ? 'gap-6' : 'gap-4'}`}
      >
        {doubled.map((item, index) => (
          <div
            key={`${item.user}-${index}`}
            className={`flex items-center whitespace-nowrap font-mono ${
              isHero
                ? 'gap-2 text-[11px] md:text-xs'
                : 'gap-2 rounded border hairline bg-background-100/60 px-3 py-1.5 text-[11px]'
            }`}
          >
            <span className="text-foreground-500">
              {isHero ? <span className="text-foreground-400">[OK]</span> : '●'}
            </span>
            <span className="text-foreground-300">{item.user}</span>
            <span className="text-foreground-600">vừa trúng</span>
            <span className="font-semibold text-primary-500">{item.amount}</span>
            {!isHero && <span className="hidden text-foreground-600 sm:inline">· {item.table}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TickerLink() {
  return (
    <RouterLink
      to="/games"
      className="shrink-0 whitespace-nowrap font-mono text-[11px] text-primary-500 transition-colors hover:text-primary-400"
    >
      xem tất cả →
    </RouterLink>
  );
}