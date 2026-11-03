import { useEffect, useRef } from 'react';
import TermWindow from '@/components/base/TermWindow';

export type HackTone = 'ok' | 'warn' | 'bad' | 'dim';
export type HackKind = 'cmd' | 'out' | 'hex';

export type HackLine = {
  text: string;
  tone?: HackTone;
  kind?: HackKind;
};

type HackTerminalProps = {
  lines: HackLine[];
  shown: number;
  progress: number;
  running: boolean;
  casino: string;
};

const toneClass: Record<HackTone, string> = {
  ok: 'text-primary-500',
  warn: 'text-accent-500',
  bad: 'text-accent-500 font-semibold',
  dim: 'text-foreground-600',
};

export default function HackTerminal({
  lines,
  shown,
  progress,
  running,
  casino,
}: HackTerminalProps) {
  const printed = lines.slice(0, shown);
  const idle = lines.length === 0;
  const viewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = viewRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [shown, lines.length]);

  return (
    <TermWindow
      title={
        idle ? '~/tool-ai-yg88 :: hidden-code' : `~/tool-ai-yg88 :: ${casino || 'hidden-code'}`
      }
      toolbarRight={
        <span className="flex items-center gap-1.5 font-mono text-[10px] whitespace-nowrap text-foreground-600">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              running ? 'animate-pulse-dot bg-accent-500' : 'bg-primary-500/70'
            }`}
          />
          {idle ? 'idle' : running ? 'running' : 'done'}
        </span>
      }
    >
      <div className="scanlines relative">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b hairline bg-background-50/60 px-3 py-1.5 font-mono text-[9px] tracking-[0.1em] text-foreground-600 uppercase md:px-4">
          <span className="text-primary-500">streams 1.248</span>
          <span>conf {running ? Math.min(96, 60 + Math.round(progress / 3)) : 71}%</span>
          <span className="hidden sm:inline">nodes 14/14</span>
          <span className="hidden sm:inline">enc aes-256-gcm</span>
          <span className="ml-auto tabular-nums text-foreground-300">
            {String(shown).padStart(3, '0')}/{String(lines.length || 0).padStart(3, '0')}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 px-3 pt-2 font-mono text-[10px] tracking-[0.14em] text-foreground-600 uppercase md:px-4">
          <span>hidden-protect · injection</span>
          <span className="tabular-nums text-foreground-300">{progress}%</span>
        </div>
        <div className="mx-3 mt-1.5 h-1 w-[calc(100%-1.5rem)] overflow-hidden rounded-full bg-background-300/50 md:mx-4 md:w-[calc(100%-2rem)]">
          <div
            className="h-full rounded-full bg-primary-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div
          ref={viewRef}
          className="no-scrollbar mx-3 mt-2.5 mb-3 h-[300px] overflow-y-auto rounded border border-primary-500/10 bg-background-50/70 p-2.5 md:mx-4 md:h-[400px] md:p-3"
        >
          {idle ? (
            <div className="space-y-1 font-mono text-[10px] leading-relaxed">
              <p className="text-foreground-600">
                <span className="mr-1.5 text-foreground-700">00</span>
                <span className="text-primary-500">$</span> tool-ai-yg88 --mode hidden-code
              </p>
              <p className="text-foreground-600">
                <span className="mr-1.5 text-foreground-700">01</span>
                <span className="text-primary-500">$</span> tls 1.3 · node 14/14 · ready
              </p>
              <p className="text-foreground-600">
                <span className="mr-1.5 text-foreground-700">02</span>
                <span className="text-primary-500">$</span> awaiting credentials_
                <span className="ml-1 inline-block h-2.5 w-1.5 animate-caret bg-primary-500 align-middle" />
              </p>
            </div>
          ) : (
            <div className="space-y-[3px] font-mono text-[10px] leading-snug md:text-[11px]">
              {printed.map((line, index) => {
                const isCmd = line.kind === 'cmd';
                const isHex = line.kind === 'hex';
                return (
                  <p key={`${line.text}-${index}`} className="flex gap-1.5 break-words">
                    <span className="shrink-0 text-right text-foreground-700 tabular-nums">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {isCmd ? (
                      <span className="min-w-0 text-foreground-950">
                        <span className="mr-1 text-primary-500">$</span>
                        {line.text}
                      </span>
                    ) : (
                      <span
                        className={`min-w-0 ${
                          isHex
                            ? 'tracking-[0.02em] text-foreground-600/70'
                            : toneClass[line.tone ?? 'dim']
                        }`}
                      >
                        {line.text}
                      </span>
                    )}
                  </p>
                );
              })}
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
          )}
        </div>
      </div>
    </TermWindow>
  );
}