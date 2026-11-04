import { useEffect, useRef } from 'react';
import BookmakerLogo from './BookmakerLogo';
import type { HackLine, HackTone } from './HackTerminal';

const toneClass: Record<HackTone, string> = {
  ok: 'text-primary-500',
  warn: 'text-accent-500',
  bad: 'text-accent-500 font-semibold',
  dim: 'text-foreground-500',
};

type Props = {
  name: string;
  code: string;
  lines: HackLine[];
  shown: number;
  running: boolean;
  progress: number;
  preferred: boolean;
};

export default function BookmakerConsole({ name, code, lines, shown, running, progress, preferred }: Props) {
  const viewRef = useRef<HTMLDivElement>(null);
  const printed = lines.slice(0, shown);

  useEffect(() => {
    const el = viewRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [shown]);

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
            tool-ai-code.exe
            <span className="mx-1.5 text-foreground-700">—</span>
            {code} scanner
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
        <span>nodes 18/18</span>
        <span className="hidden sm:inline">aes-256-gcm</span>
        <span className="hidden sm:inline">mode {preferred ? 'license-dump' : 'capital-flow'}</span>
        <span className="ml-auto tabular-nums text-foreground-300">
          {String(shown).padStart(2, '0')}/{String(lines.length).padStart(2, '0')}
        </span>
      </div>

      <div className="p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <BookmakerLogo name={name} domain={code} size="sm" />
            <div className="min-w-0">
              <p className="truncate font-heading text-[13px] font-semibold text-foreground-950">
                {name}
              </p>
              <p className="truncate font-mono text-[9px] tracking-[0.08em] text-foreground-600">
                {code} · region ap-sg-1 · quét mã code nhà cái
              </p>
            </div>
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
          className="no-scrollbar mt-2.5 h-[280px] overflow-y-auto rounded border border-primary-500/10 bg-background-50/80 p-2.5 md:h-[340px]"
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
      </div>
    </div>
  );
}