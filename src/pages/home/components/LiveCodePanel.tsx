import { useState } from 'react';
import CodeStreamBox from '@/pages/games/components/CodeStreamBox';

export default function LiveCodePanel() {
  const [open, setOpen] = useState(true);

  return (
    <div className="pointer-events-none fixed right-3 bottom-3 z-40 w-[calc(100vw-1.5rem)] max-w-[340px] md:right-6 md:bottom-6">
      <div className="pointer-events-auto">
        {open ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Thu gọn khung mã chạy lệnh"
              title="Thu gọn"
              className="absolute -top-2.5 -right-2.5 z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-primary-500/30 bg-background-50 text-foreground-700 transition-colors hover:border-primary-500/60 hover:text-primary-500"
            >
              <i className="ri-subtract-line text-[13px]" />
            </button>
            <CodeStreamBox
              name="TOOL AI YG88"
              domain="yg88"
              variant="home"
              compact
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Mở khung mã chạy lệnh"
            title="Mở khung mã chạy lệnh"
            className="ml-auto flex cursor-pointer items-center gap-2 rounded-full border border-primary-500/30 bg-background-50/95 px-3 py-2 font-mono text-[9px] tracking-[0.12em] text-primary-500 uppercase backdrop-blur-sm transition-colors hover:border-primary-500/60"
          >
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-primary-500" />
            system stream
            <i className="ri-expand-diagonal-line text-[12px]" />
          </button>
        )}
      </div>
    </div>
  );
}