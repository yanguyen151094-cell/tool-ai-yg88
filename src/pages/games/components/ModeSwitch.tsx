type ModeSwitchProps = {
  mode: 'slot' | 'baccarat';
  onChange: (mode: 'slot' | 'baccarat') => void;
  slotCount: number;
  baccaratCount: number;
};

export default function ModeSwitch({ mode, onChange, slotCount, baccaratCount }: ModeSwitchProps) {
  const options = [
    { key: 'slot' as const, label: 'Nổ hũ', count: slotCount },
    { key: 'baccarat' as const, label: 'Baccarat', count: baccaratCount },
  ];

  return (
    <div className="grid w-full grid-cols-2 gap-1.5 rounded-md border hairline bg-background-100/60 p-1.5">
      {options.map((option) => {
        const active = mode === option.key;
        return (
          <button
            key={option.key}
            type="button"
            onClick={() => onChange(option.key)}
            className={`flex cursor-pointer items-center justify-center gap-2 rounded px-3 py-2.5 font-mono text-[11px] font-semibold tracking-[0.18em] whitespace-nowrap uppercase transition-colors sm:text-[12px] ${
              active
                ? 'bg-primary-500 text-background-50'
                : 'text-foreground-500 hover:bg-background-200/50 hover:text-foreground-950'
            }`}
          >
            <span className={active ? 'text-background-50/60' : 'text-foreground-600'}>$</span>
            {option.label}
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