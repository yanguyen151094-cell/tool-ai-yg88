import { useEffect, useMemo, useRef } from 'react';
import { SLOT_STAGES, type SlotHackLine, type SlotHackTone } from './slotHackScript';

const toneClass: Record<SlotHackTone, string> = {
  ok: 'text-primary-500',
  warn: 'text-accent-500',
  bad: 'text-accent-500 font-semibold',
  dim: 'text-foreground-500',
};

type Props = {
  gameName: string;
  code: string;
  provider: string;
  lines: SlotHackLine[];
  shown: number;
  running: boolean;
  progress: number;
  rtp: number;
  betLevel: number;
  rounds: number;
};

export default function SlotHackConsole({
  gameName,
  code,
  provider,
  lines,
  shown,
  running,
  progress,
  rtp,
  betLevel,
  rounds,
}: Props) {
  const viewRef = useRef<HTMLDivElement>(null);
  const printed = lines.slice(0, shown);

  useEffect(() => {
    const el = viewRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [shown]);

  const activeStage = useMemo(() => {
    if (!running && progress >= 100) return SLOT_STAGES.length - 1;
    if (printed.length === 0) return 0;
    return printed[printed.length - 1].stage;
  }, [printed, running, progress]);

  const confidence = Math.min(96, Math.round(62 + progress / 3));

  return (
    <div className="overflow-hidden rounded-lg border border-primary-500/25 bg-background-100">
      <div className="flex items-center justify-between gap-3 border-b hairline bg-background-50/70 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-accent-500/70" />
            <span className="h-2 w-2 rounded-full bg-secondary-500/70" />
            <span className="h-2 w-2 rounded-full bg-primary-500/80" />
          </span>
          <span className="truncate font-mono text-[10px] tracking-[0.06em] text-foreground-400">
            yg88-engine.exe
            <span className="mx-1.5 text-foreground-700">—</span>
            slot signal console
          </span>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 rounded border border-primary-500/30 bg-primary-500/10 px-2 py-1 font-mono text-[9px] tracking-[0.14em] text-primary-500 uppercase">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              running ? 'animate-pulse-dot bg-primary-500' : 'bg-primary-500/60'
            }`}
          />
          {running ? 'running' : 'complete'}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b hairline bg-background-50/40 px-3 py-1.5 font-mono text-[9px] tracking-[0.08em] text-foreground-600 uppercase">
        <span className="text-primary-500">tls 1.3</span>
        <span>nodes 14/14</span>
        <span className="hidden sm:inline">aes-256-gcm</span>
        <span className="hidden sm:inline">region ap-sg-1</span>
        <span className="ml-auto text-accent-500">license pro</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[190px_1fr]">
        <div className="border-b hairline p-3 md:border-b-0 md:border-r">
          <p className="font-mono text-[9px] tracking-[0.16em] text-foreground-600 uppercase">
            quy trình 6 tầng
          </p>
          <ol className="mt-2.5 space-y-2.5">
            {SLOT_STAGES.map((stage, index) => {
              const done = index < activeStage || (!running && progress >= 100);
              const active = index === activeStage && running;
              return (
                <li key={stage.key} className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border font-mono text-[9px] ${
                      done
                        ? 'border-primary-500/50 bg-primary-500/15 text-primary-500'
                        : active
                          ? 'animate-pulse-dot border-primary-500 bg-primary-500/25 text-primary-500'
                          : 'border-background-300/60 text-foreground-600'
                    }`}
                  >
                    {done ? <i className="ri-check-line text-[9px]" /> : index + 1}
                  </span>
                  <span className="min-w-0">
                    <span
                      className={`block truncate font-mono text-[10px] ${
                        done || active ? 'text-foreground-200' : 'text-foreground-500'
                      }`}
                    >
                      {stage.label}
                    </span>
                    <span className="block truncate font-mono text-[9px] text-foreground-600">
                      {stage.note}
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="min-w-0 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-heading text-[13px] font-semibold text-foreground-950">
                {gameName}
              </p>
              <p className="truncate font-mono text-[9px] tracking-[0.08em] text-foreground-600">
                {(provider || 'provider').toUpperCase()} · {code || 'room'} · rtp {rtp}% ·{' '}
                {betLevel.toLocaleString('vi-VN')}K × {rounds} vòng
              </p>
            </div>
            <span className="flex shrink-0 items-baseline gap-1 font-mono text-primary-500">
              <span className="text-lg font-bold tabular-nums">{progress}</span>
              <span className="text-[9px]">%</span>
            </span>
          </div>

          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-background-300/50">
            <div
              className="h-full rounded-full bg-primary-500 transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div
            ref={viewRef}
            className="no-scrollbar mt-2.5 h-[230px] overflow-y-auto rounded border border-primary-500/10 bg-background-50/80 p-2.5 md:h-[286px]"
          >
            <div className="space-y-[3px] font-mono text-[10px] leading-snug">
              {printed.map((line, index) => (
                <p key={`${line.text}-${index}`} className="flex gap-1.5 break-words">
                  <span className="shrink-0 text-right text-foreground-700 tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {line.kind === 'cmd' ? (
                    <span className="min-w-0 text-foreground-950">
                      <span className="mr-1 text-primary-500">$</span>
                      {line.text}
                    </span>
                  ) : (
                    <span
                      className={`min-w-0 ${
                        line.kind === 'hex'
                          ? 'tracking-[0.02em] text-foreground-600/70'
                          : toneClass[line.tone ?? 'dim']
                      }`}
                    >
                      {line.text}
                    </span>
                  )}
                </p>
              ))}
              {running && (
                <p className="flex gap-1.5">
                  <span className="shrink-0 text-right text-foreground-700 tabular-nums">
                    {String(printed.length + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0 text-foreground-950">
                    <span className="mr-1 text-primary-500">$</span>
                    <span className="inline-block h-2.5 w-1.5 animate-caret bg-primary-500 align-middle" />
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: 'gói tin', value: `${(1240 + printed.length * 31).toLocaleString('vi-VN')}` },
              { label: 'độ khớp', value: `${confidence}%` },
              { label: 'sai lệch', value: '0.4%' },
              { label: 'node online', value: '14/14' },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded border hairline bg-background-50/50 px-2 py-1.5"
              >
                <p className="truncate font-mono text-[8px] tracking-[0.12em] text-foreground-600 uppercase">
                  {item.label}
                </p>
                <p className="mt-0.5 truncate font-mono text-[11px] font-semibold text-foreground-950 tabular-nums">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}