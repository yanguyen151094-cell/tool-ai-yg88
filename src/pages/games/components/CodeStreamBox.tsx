import { useEffect, useRef, useState } from 'react';

type StreamKind = 'cmd' | 'hex' | 'ok' | 'warn' | 'dim';

export type StreamVariant = 'bookmaker' | 'slot' | 'baccarat' | 'home' | 'auth';

type StreamLine = {
  id: number;
  stamp: string;
  kind: StreamKind;
  text: string;
};

type Props = {
  name: string;
  domain: string;
  compact?: boolean;
  variant?: StreamVariant;
};

const HEX = '0123456789ABCDEF';
const ALNUM = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
const MAX_LINES = 48;

const randHex = (length: number) =>
  Array.from({ length }, () => HEX[Math.floor(Math.random() * HEX.length)]).join('');

const randHexLower = (length: number) => randHex(length).toLowerCase();

const randAlnum = (length: number) =>
  Array.from({ length }, () => ALNUM[Math.floor(Math.random() * ALNUM.length)]).join('');

const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));

const pad = (value: number) => String(value).padStart(2, '0');

const stampOf = (date: Date) =>
  `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

const hexRow = () => {
  const bytes = Array.from({ length: 8 }, () => randHexLower(2)).join(' ');
  return `0x${randHex(4)}  ${bytes}`;
};

const toneClass: Record<StreamKind, string> = {
  cmd: 'text-foreground-950',
  hex: 'text-foreground-600/70',
  ok: 'text-primary-500',
  warn: 'text-accent-500',
  dim: 'text-foreground-600',
};

const HEADER: Record<StreamVariant, string> = {
  bookmaker: 'code-engine · live stream',
  slot: 'slot-engine · reel stream',
  baccarat: 'baccarat-engine · shoe stream',
  home: 'ai-engine · system stream',
  auth: 'auth-engine · session stream',
};

const COUNTER_LABEL: Record<StreamVariant, string> = {
  bookmaker: 'pkts',
  slot: 'spins',
  baccarat: 'hands',
  home: 'ops',
  auth: 'reqs',
};

type Line = { kind: StreamKind; text: string };

const SHORT = (domain: string) => domain.replace(/[^a-z0-9]/gi, '').slice(0, 8).toUpperCase();

/** Luồng lệnh của khung quét nhà cái. */
const bookmakerPool = (name: string, domain: string): Line[] => {
  const short = SHORT(domain) || 'EDGE';
  return [
    { kind: 'cmd', text: `./code-engine --stream ${short} --watch 250ms --mode continuous` },
    { kind: 'ok', text: `[+] stream opened · ${short} · edge ap-sg-1 · nonce 0x${randHexLower(8)}` },
    { kind: 'hex', text: hexRow() },
    { kind: 'dim', text: `handshake tls1.3 · cipher aes-256-gcm · iv ${randHexLower(24)}` },
    { kind: 'ok', text: `keyring[${randInt(0, 7)}] verified · fingerprint ${randHexLower(16)}` },
    { kind: 'dim', text: `probe ${name} · rtt ${randInt(18, 96)}ms · hops ${randInt(4, 9)}` },
    { kind: 'warn', text: `! rate-limit window ${randInt(40, 320)}ms · retry backoff armed` },
    { kind: 'ok', text: `[+] packet #${randInt(1000, 9999)} flushed · ${randInt(12, 88)} frames` },
    { kind: 'dim', text: `syscall mmap(0x${randHexLower(6)}) → 0x${randHexLower(10)} ok` },
    { kind: 'hex', text: hexRow() },
    { kind: 'ok', text: `hash 0x${randHexLower(20)} ⇄ descriptor matched` },
    { kind: 'dim', text: `descriptor scan ${randInt(40, 99)}% · segments ${randInt(600, 1600)}` },
    {
      kind: 'ok',
      text: `serial ${randAlnum(8)} · ${randAlnum(4)}-${randAlnum(4)}-${randAlnum(4)}`,
    },
    { kind: 'dim', text: `flush buffer 0x${randHexLower(6)} · ${randInt(2, 9)} kb/s` },
    {
      kind: 'warn',
      text: `! entropy drift ${(Math.random() * 2).toFixed(3)} · recalculating vector`,
    },
    { kind: 'ok', text: `[✓] integrity check passed · sha256:${randHexLower(12)}` },
  ];
};

const SLOT_SYMBOLS = ['WILD', 'SCATTER', 'JACKPOT', 'COIN', 'WHALE', 'TIGER', 'GEM', 'BELL'];

/** Luồng lệnh của Nổ Hũ: đọc mã quay, tổ hợp, hệ số thưởng. */
const slotPool = (name: string, domain: string): Line[] => {
  const short = SHORT(domain) || 'SLOT';
  const reel = randInt(1, 5);
  const stop = randAlnum(6);
  const symbol = SLOT_SYMBOLS[randInt(0, SLOT_SYMBOLS.length - 1)];
  const nextSymbol = SLOT_SYMBOLS[randInt(0, SLOT_SYMBOLS.length - 1)];
  const payout = randInt(120, 9800);
  return [
    { kind: 'cmd', text: `./slot-engine --room ${short} --mode reel-trace --depth 12` },
    { kind: 'ok', text: `[+] rng seed 0x${randHexLower(8)} · nonce ${randInt(10000, 99999)}` },
    { kind: 'hex', text: hexRow() },
    {
      kind: 'dim',
      text: `reel[${reel}] window ${randInt(40, 180)}ms · strip stop ${stop}`,
    },
    {
      kind: 'ok',
      text: `[+] spin #${randInt(100000, 999999)} resolved · ${symbol} x${randInt(2, 40)}`,
    },
    {
      kind: 'dim',
      text: `rtp window ${(94 + Math.random() * 4).toFixed(2)}% · volatility ${randInt(3, 9)}/10`,
    },
    { kind: 'warn', text: `! scatter counter ${randInt(0, 2)}/3 · bonus gate armed` },
    {
      kind: 'ok',
      text: `payline ${randInt(1, 243)} matched · payout +${payout.toLocaleString('vi-VN')} coin`,
    },
    { kind: 'hex', text: hexRow() },
    {
      kind: 'dim',
      text: `matrix 5x3 digest ${randHexLower(16)} · ${name} ${randInt(20, 200)}ms`,
    },
    { kind: 'ok', text: `[+] cascade settle · ${randInt(2, 14)} cluster cleared` },
    {
      kind: 'dim',
      text: `jackpot pool ${randInt(200000, 9000000).toLocaleString('vi-VN')} coin · +${(Math.random() * 3).toFixed(2)}%/min`,
    },
    { kind: 'ok', text: `symbol table next: ${nextSymbol} · weight ${randInt(4, 32)}` },
    { kind: 'dim', text: `buffer 0x${randHexLower(6)} · ${randInt(2, 12)} kb/s · frames ${randInt(30, 60)}` },
    { kind: 'warn', text: `! heat ${(Math.random() * 4).toFixed(2)} · auto tune reel speed` },
    { kind: 'ok', text: `[✓] reel strip rebuilt · ${randInt(32, 128)} stops verified` },
  ];
};

const BCR_SIDE = ['PLAYER', 'BANKER', 'TIE'];
const BCR_TREND = ['B', 'P', 'B', 'B', 'P', 'T', 'P', 'B'];

/** Luồng lệnh của Baccarat: đọc giày bài, tín hiệu bàn, cầu. */
const baccaratPool = (name: string, domain: string): Line[] => {
  const short = SHORT(domain) || 'BCR';
  const player = randInt(0, 9);
  const banker = randInt(0, 9);
  const side = BCR_SIDE[randInt(0, 2)];
  const winner = player > banker ? 'PLAYER' : player < banker ? 'BANKER' : 'TIE';
  const trend = Array.from({ length: 8 }, () => BCR_TREND[randInt(0, BCR_TREND.length - 1)]).join(' ');
  return [
    { kind: 'cmd', text: `./baccarat-engine --table ${short} --mode shoe-trace --decks 8` },
    { kind: 'ok', text: `[+] shoe #${randInt(1, 89)} opened · penetration ${randInt(58, 92)}%` },
    { kind: 'hex', text: hexRow() },
    { kind: 'dim', text: `hand settled · P ${player} · B ${banker} · side ${winner}` },
    { kind: 'ok', text: `trend ${trend}` },
    {
      kind: 'dim',
      text: `big-road entries ${randInt(12, 60)} · bead plate synced · cut card ${randInt(10, 26)}`,
    },
    {
      kind: 'ok',
      text: `[+] signal ${side} · confidence ${randInt(61, 97)}% · stake unit ${randInt(2, 9)}`,
    },
    { kind: 'warn', text: `! pattern shift detected · recomputing shoe vector` },
    { kind: 'dim', text: `burn ${randInt(1, 5)} card · dealer feed 60fps · ${randInt(18, 90)}ms` },
    { kind: 'hex', text: hexRow() },
    { kind: 'ok', text: `shoe digest ${randHexLower(16)} verified · ${name}` },
    {
      kind: 'dim',
      text: `road map: ${randInt(4, 8)} clusters · streak max ${randInt(2, 12)} · chop ${randInt(1, 6)}`,
    },
    { kind: 'ok', text: `[+] value matrix ${randInt(0, 9)}-${randInt(0, 9)}-${randInt(0, 9)} mapped` },
    { kind: 'dim', text: `latency ${randInt(12, 64)}ms · packets ${randInt(200, 2400)} · loss 0.0%` },
    { kind: 'warn', text: `! variance window ${(Math.random() * 2).toFixed(2)}% · adjust stake` },
    { kind: 'ok', text: `[✓] next-shoe preload ok · ${randInt(6, 8)} decks scanned` },
  ];
};

const ENDPOINTS = ['/v1/predict', '/v1/signal', '/v1/accounts', '/v1/stream', '/v1/rtp'];
const REGIONS = ['ap-sg-1', 'ap-th-1', 'ap-vn-2', 'hk-1', 'us-west-2'];

/** Luồng lệnh tổng của hệ thống: model, dữ liệu, hạ tầng. */
const homePool = (name: string, domain: string): Line[] => {
  const short = SHORT(domain) || 'CORE';
  const endpoint = ENDPOINTS[randInt(0, ENDPOINTS.length - 1)];
  const region = REGIONS[randInt(0, REGIONS.length - 1)];
  return [
    { kind: 'cmd', text: `./ai-engine --watch all --mode predict --gpu 0 --node ${short}` },
    {
      kind: 'ok',
      text: `[+] model predict-v3 loaded · params ${(1 + Math.random() * 3).toFixed(1)}B · fp16`,
    },
    { kind: 'hex', text: hexRow() },
    {
      kind: 'dim',
      text: `infer batch ${randInt(8, 128)} · latency ${randInt(6, 48)}ms · tokens ${randInt(120, 4200)}`,
    },
    { kind: 'ok', text: `[+] ${endpoint} 200 ok · ${region} · ${randInt(9, 88)}ms` },
    {
      kind: 'dim',
      text: `dataset sync · ${randInt(1200, 98000).toLocaleString('vi-VN')} rows · ${randInt(20, 210)}ms`,
    },
    {
      kind: 'ok',
      text: `[✓] signal ACCOUNT #${randInt(10000, 99999)} · confidence ${randInt(78, 98)}%`,
    },
    { kind: 'warn', text: `! drift ${(Math.random() * 3).toFixed(3)} · retrain scheduled in ${randInt(2, 40)}m` },
    { kind: 'hex', text: hexRow() },
    {
      kind: 'dim',
      text: `cache hit ${randInt(72, 99)}% · evict ${randInt(20, 400)} keys · heap ${randInt(180, 780)}mb`,
    },
    {
      kind: 'ok',
      text: `[+] worker ${randInt(1, 12)}/${randInt(12, 24)} online · queue ${randInt(0, 24)}`,
    },
    { kind: 'dim', text: `tls1.3 · ${region} ↔ ${short} · rtt ${randInt(12, 64)}ms · loss 0.0%` },
    { kind: 'ok', text: `[✓] integrity check passed · sha256:${randHexLower(12)}` },
    {
      kind: 'dim',
      text: `stream ${randInt(800, 2400)} conn · ${randInt(4, 32)} kb/s · uptime ${randInt(20, 999)}h`,
    },
    { kind: 'warn', text: `! quota window ${randInt(60, 480)}ms · backoff armed` },
    { kind: 'ok', text: `[+] ${name} gateway synced · node ${randAlnum(6)}` },
  ];
};

const AUTH_CHANNELS = ['sms', 'telegram', 'zalo'];
const AUTH_ROLES = ['guest', 'member', 'agent', 'admin'];

/** Luồng lệnh của phiên đăng nhập / đăng ký: xác thực, token, phiên làm việc. */
const authPool = (name: string, domain: string): Line[] => {
  const short = SHORT(domain) || 'YG88';
  const channel = AUTH_CHANNELS[randInt(0, AUTH_CHANNELS.length - 1)];
  const role = AUTH_ROLES[randInt(0, AUTH_ROLES.length - 1)];
  const uid = `usr_${randHexLower(6)}`;
  return [
    { kind: 'cmd', text: `./auth-engine --watch session --mode jwt-verify --gateway ${short}` },
    {
      kind: 'dim',
      text: `handshake tls1.3 · cipher aes-256-gcm · sni ${short.toLowerCase()}.local`,
    },
    { kind: 'hex', text: hexRow() },
    {
      kind: 'ok',
      text: `[+] credential hash bcrypt cost 12 · salt ${randHexLower(8)} · verify ok`,
    },
    {
      kind: 'dim',
      text: `jwt issued · sub ${uid} · role ${role} · exp ${randInt(900, 7200)}s · alg HS256`,
    },
    {
      kind: 'ok',
      text: `[✓] device fingerprint ${randHexLower(16)} · trusted ${Math.random() > 0.25 ? 'yes' : 'pending'}`,
    },
    { kind: 'warn', text: `! rate-limit window 60s · ${randInt(1, 5)}/8 attempt · backoff armed` },
    {
      kind: 'dim',
      text: `session store redis://ap-sg-1 · ttl ${randInt(600, 86400)}s · slots ${randInt(1, 3)}`,
    },
    { kind: 'hex', text: hexRow() },
    {
      kind: 'ok',
      text: `[+] otp channel ${channel} · queue ${randInt(0, 12)} · delivery ${randInt(120, 2400)}ms`,
    },
    {
      kind: 'dim',
      text: `geo lookup · ${randInt(2, 240)}ms · edge ap-vn-1 · hops ${randInt(4, 9)}`,
    },
    { kind: 'ok', text: `[✓] csrf token rotated · 0x${randHexLower(24)}` },
    {
      kind: 'dim',
      text: `audit chain append · entry #${randInt(10000, 99999)} · sha256:${randHexLower(12)}`,
    },
    { kind: 'warn', text: `! anomaly score ${(Math.random() * 2).toFixed(3)} · silent challenge armed` },
    {
      kind: 'ok',
      text: `[+] login ok · ${uid} · ${role} · ${randInt(40, 320)}ms · node ${randAlnum(6)}`,
    },
    { kind: 'dim', text: `gateway ${short} · ${name} · conn ${randInt(80, 900)} · uptime ${randInt(4, 720)}h` },
  ];
};

const makeLine = (
  cycle: number,
  name: string,
  domain: string,
  variant: StreamVariant,
): Line => {
  const pool =
    variant === 'slot'
      ? slotPool(name, domain)
      : variant === 'baccarat'
        ? baccaratPool(name, domain)
        : variant === 'home'
          ? homePool(name, domain)
          : variant === 'auth'
            ? authPool(name, domain)
            : bookmakerPool(name, domain);
  return pool[cycle % pool.length];
};

export default function CodeStreamBox({
  name,
  domain,
  compact = false,
  variant = 'bookmaker',
}: Props) {
  const [lines, setLines] = useState<StreamLine[]>([]);
  const [pulse, setPulse] = useState({ pkts: 0, vol: 0 });
  const cycleRef = useRef(0);
  const idRef = useRef(0);
  const viewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLines([]);
    cycleRef.current = 0;
    idRef.current = 0;
    setPulse({ pkts: 0, vol: 0 });
  }, [name, domain, variant]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const next = makeLine(cycleRef.current, name, domain, variant);
      cycleRef.current += 1;
      idRef.current += 1;
      setLines((prev) => {
        const merged = [
          ...prev,
          { id: idRef.current, stamp: stampOf(new Date()), kind: next.kind, text: next.text },
        ];
        return merged.length > MAX_LINES ? merged.slice(merged.length - MAX_LINES) : merged;
      });
      setPulse((prev) => ({
        pkts: prev.pkts + randInt(8, 42),
        vol: prev.vol + randInt(1, 6),
      }));
    }, 620);

    return () => window.clearInterval(timer);
  }, [name, domain, variant]);

  useEffect(() => {
    const el = viewRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines.length]);

  return (
    <div className="overflow-hidden rounded-md border border-primary-500/25 bg-background-100">
      <div className="flex items-center justify-between gap-2 border-b hairline bg-background-50/70 px-2.5 py-1.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex shrink-0 items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-500/70" />
            <span className="h-1.5 w-1.5 rounded-full bg-secondary-500/70" />
            <span className="h-1.5 w-1.5 rounded-full bg-primary-500/80" />
          </span>
          <span className="truncate font-mono text-[9px] tracking-[0.12em] text-foreground-500 uppercase">
            {HEADER[variant]}
          </span>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-primary-500/30 bg-primary-500/10 px-2 py-0.5 font-mono text-[8px] tracking-[0.12em] text-primary-500 uppercase">
          <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-primary-500" />
          đang chạy
        </span>
      </div>

      <div
        ref={viewRef}
        className={`no-scrollbar overflow-y-auto bg-background-50/80 px-2 py-1.5 ${
          compact ? 'h-[132px]' : 'h-[152px]'
        }`}
      >
        <div className="space-y-[2px] font-mono text-[9px] leading-snug">
          {lines.map((line, index) => (
            <p key={line.id} className="flex gap-1.5 break-all">
              <span className="shrink-0 text-foreground-700 tabular-nums">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="shrink-0 text-foreground-600/80 tabular-nums">{line.stamp}</span>
              {line.kind === 'cmd' ? (
                <span className={`min-w-0 ${toneClass.cmd}`}>
                  <span className="mr-1 text-primary-500">$</span>
                  {line.text}
                </span>
              ) : (
                <span className={`min-w-0 ${toneClass[line.kind]}`}>{line.text}</span>
              )}
            </p>
          ))}
          <p className="flex gap-1.5">
            <span className="shrink-0 text-foreground-700 tabular-nums">
              {String(lines.length + 1).padStart(2, '0')}
            </span>
            <span className="shrink-0 text-foreground-600/80 tabular-nums">
              {stampOf(new Date())}
            </span>
            <span className="min-w-0 text-foreground-950">
              <span className="mr-1 text-primary-500">$</span>
              <span className="inline-block h-2 w-1.5 animate-caret bg-primary-500 align-middle" />
            </span>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 border-t hairline bg-background-50/60 px-2.5 py-1 font-mono text-[8px] tracking-[0.08em] text-foreground-600 uppercase">
        <span className="text-primary-500">streaming</span>
        <span>
          {COUNTER_LABEL[variant]} {pulse.pkts.toLocaleString('vi-VN')}
        </span>
        <span>{pulse.vol.toLocaleString('vi-VN')} kb/s</span>
        <span className="ml-auto tabular-nums text-foreground-300">
          {String(lines.length).padStart(2, '0')}/{MAX_LINES}
        </span>
      </div>
    </div>
  );
}