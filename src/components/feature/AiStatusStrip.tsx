import { useEffect, useState } from 'react';

type AiStatusStripProps = {
  sticky?: boolean;
};

export default function AiStatusStrip({ sticky = false }: AiStatusStripProps) {
  const [latency, setLatency] = useState(23);
  const [streams, setStreams] = useState(1247);
  const [conf, setConf] = useState(94);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLatency(18 + Math.floor(Math.random() * 12));
      setStreams((prev) => prev + Math.floor(Math.random() * 9) - 3);
      setConf(91 + Math.floor(Math.random() * 6));
    }, 2600);
    return () => window.clearInterval(timer);
  }, []);

  const items = [
    { k: 'model', v: 'v3.2' },
    { k: 'lat', v: `${latency}ms` },
    { k: 'streams', v: streams.toLocaleString('vi-VN') },
    { k: 'conf', v: `${conf}%` },
  ];

  return (
    <div
      className={`w-full border-y hairline bg-background-100/80 ${
        sticky ? 'sticky top-16 z-40 backdrop-blur-md md:top-[72px]' : ''
      }`}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2.5 md:px-6 lg:px-10">
        <span className="flex items-center gap-2 font-mono text-[11px] text-primary-500">
          <i className="ri-terminal-box-line text-[13px]" />
          root@ai $
        </span>
        <span className="flex items-center gap-2 font-mono text-[11px] text-foreground-400">
          <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-primary-500" />
          online
        </span>
        {items.map((item) => (
          <span
            key={item.k}
            className="flex items-center gap-1.5 font-mono text-[11px] whitespace-nowrap"
          >
            <span className="text-foreground-600">{item.k}</span>
            <span className="text-foreground-200">{item.v}</span>
          </span>
        ))}
        <span className="ml-auto hidden items-center gap-2 rounded border border-accent-500/30 bg-accent-500/10 px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] whitespace-nowrap text-accent-500 sm:flex">
          <i className="ri-shield-check-line text-[12px]" />
          SSL 1.3
        </span>
      </div>
    </div>
  );
}