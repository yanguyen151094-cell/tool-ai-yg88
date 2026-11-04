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

export default function ModeSwitch({
  mode,
  onChange,
  slotCount,
  baccaratCount,
  casinoCount,
  showCasino,
  locked = false,
}: ModeSwitchProps) {
  const options = [
    { key: 'slot' as const, label: 'Nổ hũ', count: slotCount },
    { key: 'baccarat' as const, label: 'Baccarat', count: baccaratCount },
    ...(showCasino
      ? [{ key: 'casino' as const, label: 'Quét mã nhà cái', count: casinoCount }]
      : []),
  ];

  return (
    <div
      className={`grid w-full gap-1.5 rounded-md border hairline bg-background-100/60 p-1.5 ${
        options.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2'
      }`}
    >
      {options.map((option) => {
        const active = mode === option.key;
        return (
          <button
            key={option.key}
            type="button"
            onClick={() => onChange(option.key)}
            className={`flex cursor-pointer items-center justify-center gap-2 rounded px-3 py-2.5 font-mono text-[11px] font-semibold tracking-[0.14em] whitespace-nowrap uppercase transition-colors sm:text-[12px] ${
              active
                ? 'bg-primary-500 text-background-50'
                : 'text-foreground-500 hover:bg-background-200/50 hover:text-foreground-950'
            }`}
          >
            <span className={active ? 'text-background-50/60' : 'text-foreground-600'}>$</span>
            {option.label}
            {option.key === 'casino' && locked ? (
              <i className="ri-lock-2-line text-[11px] text-accent-500" aria-hidden="true" />
            ) : null}
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] tracking-normal ${
                active
                  ? 'bg-background-50/20 text-background-50'
                  : 'bg-background-200/80 text-foreground-500'
              }`}
            >
              {option.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}