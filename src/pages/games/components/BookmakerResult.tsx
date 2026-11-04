import { useState } from 'react';
import type { FormEvent } from 'react';
import { PROFESSIONAL_CODES, isProfessionalCode } from './bookmakerScript';
import type { Bookmaker } from '@/mocks/bookmakers';

type Props = {
  bookmaker: Bookmaker;
  preferred: boolean;
  winRate: number;
  codes: string[];
  canUseCodes: boolean;
  onRescan: () => void;
  onClose: () => void;
};

const normalize = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, '');

export default function BookmakerResult({
  bookmaker,
  preferred,
  winRate,
  codes,
  canUseCodes,
  onRescan,
  onClose,
}: Props) {
  const [copied, setCopied] = useState('');
  const [entryCode, setEntryCode] = useState('');
  const [entryState, setEntryState] = useState<'idle' | 'ok' | 'err'>('idle');
  const [entryMessage, setEntryMessage] = useState('');
  const [account, setAccount] = useState('');
  const [claimCode, setClaimCode] = useState('');
  const [claimError, setClaimError] = useState('');
  const [claim, setClaim] = useState<{ account: string; code: string } | null>(null);

  const copyCode = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      window.setTimeout(() => setCopied(''), 1600);
    } catch {
      setCopied('');
    }
  };

  const submitEntry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isProfessionalCode(entryCode)) {
      setEntryState('err');
      setEntryMessage(
        'Mã code chưa đúng. Chỉ dùng các khoá chuyên nghiệp: 8 · 18 · 38 · 68 · 88 · 188 · 288 · 588 · 1888 · 3888.',
      );
      return;
    }
    setEntryState('ok');
    setEntryMessage(
      `Mã code ${normalize(entryCode)} đã được xác thực thành công cho ${bookmaker.name}.`,
    );
    setClaimCode((prev) => prev || normalize(entryCode));
  };

  const submitClaim = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!account.trim()) {
      setClaimError('Nhập tên tài khoản trước đã.');
      setClaim(null);
      return;
    }
    if (!isProfessionalCode(claimCode)) {
      setClaimError('Mã code không hợp lệ, nhập lại khoá chuyên nghiệp 8 → 3888.');
      setClaim(null);
      return;
    }
    setClaimError('');
    setClaim({ account: account.trim(), code: normalize(claimCode) });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border hairline bg-background-50/70 px-3 py-2.5">
        <div className="min-w-0">
          <p className="truncate font-heading text-[14px] font-bold text-foreground-950">
            {bookmaker.name}
          </p>
          <p className="truncate font-mono text-[9px] tracking-[0.1em] text-foreground-600 uppercase">
            {bookmaker.domain} · {bookmaker.region} · phiên quét đã kết thúc
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onRescan}
            className="flex cursor-pointer items-center gap-1.5 rounded border border-primary-500/40 px-2.5 py-1.5 font-mono text-[10px] whitespace-nowrap text-primary-500 transition-colors hover:bg-primary-500/10"
          >
            <i className="ri-refresh-line" />
            quét lại phiên mới
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex cursor-pointer items-center gap-1.5 rounded border hairline px-2.5 py-1.5 font-mono text-[10px] whitespace-nowrap text-foreground-400 transition-colors hover:text-foreground-950"
          >
            <i className="ri-close-line" />
            đóng
          </button>
        </div>
      </div>

      {!preferred && (
        <>
          <div className="rounded-md border border-accent-500/30 bg-accent-500/5 p-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-accent-500/40 bg-accent-500/15 px-2.5 py-1 font-mono text-[9px] tracking-[0.14em] text-accent-500 uppercase">
                <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-accent-500" />
                đang thu hút vốn
              </span>
              <span className="rounded-full border hairline bg-background-50/70 px-2.5 py-1 font-mono text-[9px] tracking-[0.12em] text-foreground-500 uppercase">
                không có mã code
              </span>
            </div>
            <p className="mt-2.5 text-sm leading-relaxed text-foreground-300">
              {bookmaker.name} hiện đang thu hút vốn, hệ thống không tìm thấy bảng mã code nào để
              trích xuất. Tỷ lệ thắng sẽ nhảy liên tục trong khoảng 0% – 20% sau mỗi phiên quét.
            </p>
          </div>

          <div className="rounded-md border hairline bg-background-50/60 p-3.5">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="font-mono text-[9px] tracking-[0.16em] text-foreground-600 uppercase">
                  tỷ lệ thắng phiên này
                </p>
                <p className="mt-1 flex items-baseline gap-1 font-heading text-3xl font-bold text-primary-500 tabular-nums">
                  {winRate}
                  <span className="text-sm font-semibold text-foreground-500">%</span>
                </p>
              </div>
              <p className="font-mono text-[10px] text-foreground-600">
                khung dao động: <span className="text-foreground-300">0% – 20%</span>
              </p>
            </div>
            <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-background-300/50">
              <div
                className="h-full rounded-full bg-accent-500 transition-all duration-500"
                style={{ width: `${Math.max(2, (winRate / 20) * 100)}%` }}
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: 'dòng tiền vào', value: bookmaker.volume },
                { label: 'ví nóng', value: '4' },
                { label: 'độ lệch', value: '1.8%' },
                { label: 'mã code', value: '0' },
              ].map((item) => (
                <div key={item.label} className="rounded border hairline bg-background-100/60 px-2 py-1.5">
                  <p className="truncate font-mono text-[8px] tracking-[0.12em] text-foreground-600 uppercase">
                    {item.label}
                  </p>
                  <p className="mt-0.5 truncate font-mono text-[11px] font-semibold text-foreground-950 tabular-nums">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-2.5 font-mono text-[9px] leading-relaxed text-foreground-600">
              bấm “quét lại phiên mới” để bốc lại một tỷ lệ khác — con số thay đổi mỗi lần quét và
              luôn nằm dưới 20%.
            </p>
          </div>
        </>
      )}

      {preferred && !canUseCodes && (
        <div className="rounded-md border border-accent-500/30 bg-accent-500/5 p-4">
          <p className="flex items-center gap-2 font-mono text-[11px] text-accent-500">
            <i className="ri-lock-2-line" />
            Khu mã code chuyên nghiệp chỉ mở cho admin được chủ web cấp quyền.
          </p>
        </div>
      )}

      {preferred && canUseCodes && (
        <>
          <div className="rounded-md border border-primary-500/30 bg-primary-500/5 p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-mono text-[9px] tracking-[0.16em] text-primary-500 uppercase">
                  $ license --export
                </p>
                <p className="mt-1 font-heading text-[14px] font-bold text-foreground-950">
                  Loạt mã code chuyên nghiệp của {bookmaker.name}
                </p>
              </div>
              <span className="rounded-full border border-primary-500/40 bg-primary-500/10 px-2.5 py-1 font-mono text-[9px] tracking-[0.12em] text-primary-500 uppercase">
                {codes.length} khoá · đã giải
              </span>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {codes.map((code, index) => (
                <div
                  key={code}
                  className="flex items-center gap-2 rounded border hairline bg-background-50/80 px-2 py-1.5"
                >
                  <span className="w-4 shrink-0 font-mono text-[9px] text-foreground-600 tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-mono text-[12px] tracking-[0.1em] text-primary-500">
                    {code}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyCode(code)}
                    className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded border hairline text-foreground-500 transition-colors hover:text-primary-500"
                    aria-label={`Chép mã ${code}`}
                  >
                    <i className={copied === code ? 'ri-check-line text-[11px]' : 'ri-file-copy-line text-[11px]'} />
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-2.5 font-mono text-[9px] leading-relaxed text-foreground-600">
              Mỗi phiên quét sẽ thay đổi ký tự hoặc thêm ký tự mới vào loạt mã — bấm “quét lại phiên
              mới” để lấy loạt mã khác.
            </p>
          </div>

          <form
            onSubmit={submitEntry}
            className="rounded-md border hairline bg-background-50/60 p-3.5"
          >
            <p className="font-mono text-[9px] tracking-[0.16em] text-foreground-600 uppercase">
              nhập code chuyên nghiệp
            </p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                value={entryCode}
                onChange={(event) => {
                  setEntryCode(event.target.value);
                  setEntryState('idle');
                  setEntryMessage('');
                }}
                placeholder="Nhập mã code (vd: 1888)"
                autoComplete="off"
                spellCheck={false}
                className="w-full min-w-0 rounded border border-background-300/50 bg-background-50/80 px-3 py-2 font-mono text-[12px] tracking-[0.08em] text-foreground-950 placeholder:text-foreground-600 focus:border-primary-500/60"
              />
              <button
                type="submit"
                className="flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md bg-primary-500 px-4 py-2 font-mono text-[11px] font-semibold whitespace-nowrap text-background-50 transition-colors hover:bg-primary-400"
              >
                <i className="ri-shield-keyhole-line" />
                xác thực mã
              </button>
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {PROFESSIONAL_CODES.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    setEntryCode(code);
                    setEntryState('idle');
                    setEntryMessage('');
                  }}
                  className={`cursor-pointer rounded border px-2 py-1 font-mono text-[10px] whitespace-nowrap transition-colors ${
                    normalize(entryCode) === code
                      ? 'border-primary-500/60 bg-primary-500/15 text-primary-500'
                      : 'border-background-300/50 bg-background-50/60 text-foreground-500 hover:text-foreground-950'
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>

            {entryState !== 'idle' && (
              <div
                className={`mt-2.5 flex items-start gap-2 rounded border px-3 py-2 ${
                  entryState === 'ok'
                    ? 'border-primary-500/40 bg-primary-500/10'
                    : 'border-accent-500/40 bg-accent-500/10'
                }`}
              >
                <i
                  className={`mt-0.5 text-[13px] ${
                    entryState === 'ok'
                      ? 'ri-checkbox-circle-line text-primary-500'
                      : 'ri-error-warning-line text-accent-500'
                  }`}
                />
                <p
                  className={`font-mono text-[10px] leading-relaxed ${
                    entryState === 'ok' ? 'text-primary-500' : 'text-accent-500'
                  }`}
                >
                  {entryMessage}
                </p>
              </div>
            )}
          </form>

          <form onSubmit={submitClaim} className="rounded-md border hairline bg-background-50/60 p-3.5">
            <p className="font-mono text-[9px] tracking-[0.16em] text-foreground-600 uppercase">
              nhập tên tài khoản &amp; mã code
            </p>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                value={account}
                onChange={(event) => {
                  setAccount(event.target.value);
                  setClaimError('');
                }}
                placeholder="Tên tài khoản khách"
                autoComplete="off"
                spellCheck={false}
                className="w-full min-w-0 rounded border border-background-300/50 bg-background-50/80 px-3 py-2 font-mono text-[12px] text-foreground-950 placeholder:text-foreground-600 focus:border-primary-500/60"
              />
              <input
                value={claimCode}
                onChange={(event) => {
                  setClaimCode(event.target.value);
                  setClaimError('');
                }}
                placeholder="Mã code (vd: 588)"
                autoComplete="off"
                spellCheck={false}
                className="w-full min-w-0 rounded border border-background-300/50 bg-background-50/80 px-3 py-2 font-mono text-[12px] tracking-[0.08em] text-foreground-950 placeholder:text-foreground-600 focus:border-primary-500/60"
              />
            </div>
            <button
              type="submit"
              className="mt-2 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md bg-accent-500 px-4 py-2 font-mono text-[11px] font-semibold whitespace-nowrap text-background-50 transition-colors hover:bg-accent-500/85"
            >
              <i className="ri-award-line" />
              gửi mã chúc mừng
            </button>

            {claimError && (
              <p className="mt-2 flex items-start gap-2 font-mono text-[10px] leading-relaxed text-accent-500">
                <i className="ri-error-warning-line mt-0.5" />
                {claimError}
              </p>
            )}

            {claim && (
              <div className="mt-2.5 overflow-hidden rounded-md border border-primary-500/40 bg-primary-500/10 p-3">
                <p className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.18em] text-primary-500 uppercase">
                  <i className="ri-sparkling-2-line" />
                  tin nhắn chúc mừng
                </p>
                <p className="mt-1.5 font-heading text-[14px] font-bold text-foreground-950">
                  Chúc mừng {claim.account}!
                </p>
                <p className="mt-1 font-mono text-[10px] leading-relaxed text-foreground-400">
                  Tài khoản <span className="text-foreground-950">{claim.account}</span> đã nhận mã
                  chuyên nghiệp <span className="text-primary-500">{claim.code}</span> tại{' '}
                  {bookmaker.name}. Hệ thống đã ghi nhận và kích hoạt ưu đãi cho phiên này.
                </p>
              </div>
            )}
          </form>
        </>
      )}
    </div>
  );
}