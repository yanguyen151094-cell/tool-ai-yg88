type Mode = 'slot' | 'baccarat' | 'casino';

type ModeSwitchProps = {
  mode: Mode;
  onChange: (mode: Mode) => void;
  slotCount: number;
  baccaratCount: number;
  casinoCount: number;
  showCasino: boolean;
  locked?: boolean;
};

const OPTIONS = [
  {
    key: 'slot' as const,
    label: 'Nổ hũ',
    sub: 'slot · jackpot',
    icon: 'ri-coins-line',
  },
  {
    key: 'baccarat' as const,
    label: 'Baccarat',
    sub: 'phiên bẻ khoá',
    icon: 'ri-live-line',
  },
  {
    key: 'casino' as const,
    label: 'Quét mã nhà cái',
    sub: 'license dump',
    icon: 'ri-qr-scan-2-line',
  },
];

export default function ModeSwitch({
  mode,
  onChange,
  slotCount,
  baccaratCount,
  casinoCount,
  showCasino,
  locked = false,
}: ModeSwitchProps) {
  const counts: Record<Mode, number> = {
    slot: slotCount,
    baccarat: baccaratCount,
    casino: casinoCount,
  };

  const options = OPTIONS.filter((option) => option.key !== 'casino' || showCasino);

  return (
    <div
      className={`grid w-full gap-2 rounded-xl border border-primary-500/25 bg-background-100/70 p-2 ${
        options.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2'
      }`}
    >
      {options.map((option) => {
        const active = mode === option.key;
        const isCasino = option.key === 'casino';

        return (
          <button
            key={option.key}
            type="button"
            onClick={() => onChange(option.key)}
            aria-pressed={active}
            className={`group relative flex cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-lg border px-3 py-3 transition-all duration-200 sm:px-4 sm:py-3.5 ${
              active
                ? isCasino
                  ? 'term-glow border-accent-500/70 bg-accent-500 text-background-50'
                  : 'term-glow border-primary-500/70 bg-primary-500 text-background-50'
                : isCasino
                  ? 'border-accent-500/45 bg-accent-500/10 text-accent-500 hover:border-accent-500/80 hover:bg-accent-500/20'
                  : 'border-background-300/40 bg-background-50/60 text-foreground-300 hover:border-primary-500/50 hover:bg-primary-500/10 hover:text-foreground-950'
            }`}
          >
            {!active && (
              <span
                className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${
                  isCasino
                    ? 'bg-gradient-to-br from-accent-500/15 via-transparent to-transparent'
                    : 'bg-gradient-to-br from-primary-500/15 via-transparent to-transparent'
                }`}
              />
            )}

            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                active
                  ? 'border-background-50/30 bg-background-50/20 text-background-50'
                  : isCasino
                    ? 'border-accent-500/40 bg-accent-500/15 text-accent-500'
                    : 'border-primary-500/30 bg-primary-500/10 text-primary-500'
              }`}
            >
              <i className={`${option.icon} text-[17px]`} />
            </span>

            <span className="relative min-w-0 text-left">
              <span className="flex items-center gap-1.5">
                <span className="truncate font-heading text-[13px] font-bold tracking-[0.04em] whitespace-nowrap uppercase sm:text-[14px]">
                  {option.label}
                </span>
                {isCasino && !locked && (
                  <span
                    className={`shrink-0 rounded-full px-1.5 py-0.5 font-mono text-[8px] tracking-[0.12em] uppercase ${
                      active
                        ? 'bg-background-50/25 text-background-50'
                        : 'bg-accent-500/20 text-accent-500'
                    }`}
                  >
                    hot
                  </span>
                )}
                {isCasino && locked ? (
                  <i className="ri-lock-2-line shrink-0 text-[11px]" aria-hidden="true" />
                ) : null}
              </span>
              <span
                className={`mt-0.5 block truncate font-mono text-[9px] tracking-[0.1em] uppercase ${
                  active ? 'text-background-50/70' : 'text-foreground-600'
                }`}
              >
                {option.sub}
              </span>
            </span>

            <span
              className={`ml-auto shrink-0 rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold tabular-nums ${
                active
                  ? 'bg-background-50/20 text-background-50'
                  : isCasino
                    ? 'bg-accent-500/15 text-accent-500'
                    : 'bg-background-200/80 text-foreground-500'
              }`}
            >
              {counts[option.key]}
            </span>
          </button>
        );
      })}
    </div>
  );
}