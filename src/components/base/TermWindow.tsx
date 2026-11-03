import type { ReactNode } from 'react';

type TermWindowProps = {
  title?: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  toolbarRight?: ReactNode;
};

export default function TermWindow({
  title = '~/tool-ai-yg88',
  children,
  className = '',
  bodyClassName = '',
  toolbarRight,
}: TermWindowProps) {
  return (
    <div
      className={`term-panel term-glow relative overflow-hidden rounded-lg ${className}`}
    >
      <div className="flex items-center justify-between gap-3 border-b hairline bg-background-100/70 px-3 py-2 md:px-4">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-accent-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-secondary-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-primary-500/80" />
        </div>
        <span className="truncate font-mono text-[10px] tracking-[0.18em] text-foreground-600 uppercase md:text-[11px]">
          {title}
        </span>
        <div className="flex min-w-[46px] items-center justify-end gap-2">
          {toolbarRight ?? (
            <span className="font-mono text-[10px] text-foreground-600">● ● ●</span>
          )}
        </div>
      </div>
      <div className={`relative ${bodyClassName}`}>{children}</div>
    </div>
  );
}