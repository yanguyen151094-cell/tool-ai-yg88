import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Fireworks from '@/components/feature/Fireworks';
import { findVaultCode, formatVnd } from './bookmakerScript';
import type { VaultCode } from './bookmakerScript';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

type Props = {
  open: boolean;
  vault: VaultCode[];
  bookmakerName: string;
  onClose: () => void;
};

const normalize = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, '');

export default function CodeClaimModal({ open, vault, bookmakerName, onClose }: Props) {
  const [code, setCode] = useState('');
  const [account, setAccount] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ account: string; item: VaultCode } | null>(null);
  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setCode('');
      setAccount('');
      setError('');
      setResult(null);
    }
  }, [open]);

  if (!open) return null;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = account.trim();
    if (!name) {
      setError('Anh nhập tên tài khoản nhận mã code giúp em.');
      return;
    }
    if (normalize(code).length < 1) {
      setError('Anh nhập mã code giúp em.');
      return;
    }
    const item = findVaultCode(code, vault);
    if (!item) {
      setError(
        'Mã code không có trong phiên này. Anh chép lại mã ở danh sách 10 khoá phía trên rồi nhập lại.',
      );
      return;
    }
    setError('');
    setResult({ account: name, item });
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto px-3 py-6 md:items-center">
      <button
        type="button"
        aria-label="Đóng"
        onClick={onClose}
        className="fixed inset-0 cursor-default bg-background-50/90 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-lg overflow-hidden rounded-lg border border-primary-500/35 bg-background-100 term-glow">
        <div className="pointer-events-none absolute inset-0 scanlines" />

        <div className="relative flex items-center justify-between gap-3 border-b hairline px-4 py-2.5">
          <div className="min-w-0">
            <p className="truncate font-mono text-[10px] tracking-[0.18em] text-primary-500 uppercase">
              claim --code
            </p>
            <p className="mt-0.5 truncate font-mono text-[9px] text-foreground-600">
              {bookmakerName} · nhập mã code &amp; tên tài khoản
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
            className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded border hairline text-foreground-500 transition-colors hover:text-primary-500"
          >
            <i className="ri-close-line text-sm" />
          </button>
        </div>

        <div className="relative p-4 md:p-5">
          {result ? (
            <div className="relative overflow-hidden rounded-lg border border-primary-500/45 bg-primary-500/10 px-4 py-6 text-center">
              <Fireworks bursts={4} particles={14} />
              <div className="relative">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-primary-500/50 bg-background-100/80">
                  <i className="ri-checkbox-circle-fill text-2xl text-primary-500" />
                </span>
                <p className="mt-3 font-mono text-[10px] tracking-[0.22em] text-primary-500 uppercase">
                  nhập mã code thành công
                </p>
                <p className="mt-2 font-heading text-xl font-bold text-foreground-950">
                  Chúc mừng {result.account}!
                </p>

                <div className="mx-auto mt-4 max-w-xs space-y-2 rounded-md border border-primary-500/30 bg-background-50/70 p-3 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] tracking-[0.12em] text-foreground-600 uppercase">
                      tên tài khoản
                    </span>
                    <span className="min-w-0 truncate font-mono text-[12px] text-foreground-950">
                      {result.account}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 border-t hairline pt-2">
                    <span className="font-mono text-[10px] tracking-[0.12em] text-foreground-600 uppercase">
                      mã code
                    </span>
                    <span className="font-mono text-[12px] tracking-[0.08em] text-primary-500">
                      {result.item.serial}
                    </span>
                  </div>
                  <div className="flex items-end justify-between gap-2 border-t hairline pt-2">
                    <span className="font-mono text-[10px] tracking-[0.12em] text-foreground-600 uppercase">
                      số tiền
                    </span>
                    <span className="font-heading text-xl font-bold text-accent-500 tabular-nums">
                      {formatVnd(result.item.amount)}
                    </span>
                  </div>
                </div>

                <p className="mt-3 font-mono text-[9px] leading-relaxed text-foreground-600">
                  Hệ thống đã ghi nhận mã {result.item.code} cho {bookmakerName}. Mệnh giá áp dụng
                  theo thang 8K – 588K.
                </p>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      setResult(null);
                      setCode('');
                      setAccount('');
                      setError('');
                    }}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-primary-500/45 px-3 py-2.5 font-mono text-[11px] whitespace-nowrap text-primary-500 transition-colors hover:bg-primary-500/10"
                  >
                    <i className="ri-add-line" />
                    nhập mã khác
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md bg-primary-500 px-3 py-2.5 font-mono text-[11px] font-bold whitespace-nowrap text-background-50 transition-colors hover:bg-primary-400"
                  >
                    <i className="ri-check-line" />
                    xong
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <div className="flex items-start gap-2 rounded-md border border-primary-500/25 bg-primary-500/5 px-3 py-2">
                <i className="ri-shield-keyhole-line mt-0.5 text-[13px] text-primary-500" />
                <p className="min-w-0 font-mono text-[10px] leading-relaxed text-foreground-500">
                  Nhập mã code vừa trích xuất và tên tài khoản nhận. Hệ thống sẽ báo thành công kèm
                  số tiền tương ứng với mã đó.
                </p>
              </div>

              <div>
                <label
                  htmlFor="claim-code"
                  className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-foreground-600 uppercase"
                >
                  nhập mã code
                </label>
                <div className="relative">
                  <i className="ri-qr-scan-2-line pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[15px] text-primary-500" />
                  <input
                    id="claim-code"
                    value={code}
                    onChange={(event) => {
                      setCode(event.target.value);
                      setError('');
                    }}
                    placeholder="vd: GY27CM8Z hoặc 588"
                    autoComplete="off"
                    spellCheck={false}
                    className="w-full rounded-md border border-background-300/50 bg-background-50/80 py-2.5 pr-3 pl-9 font-mono text-[13px] tracking-[0.08em] text-foreground-950 uppercase placeholder:tracking-normal placeholder:text-foreground-600 focus:border-primary-500/60"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="claim-account"
                  className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-foreground-600 uppercase"
                >
                  tên tài khoản
                </label>
                <div className="relative">
                  <i className="ri-user-3-line pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[15px] text-primary-500" />
                  <input
                    id="claim-account"
                    value={account}
                    onChange={(event) => {
                      setAccount(event.target.value);
                      setError('');
                    }}
                    placeholder="Tên tài khoản khách nhận mã"
                    autoComplete="off"
                    spellCheck={false}
                    className="w-full rounded-md border border-background-300/50 bg-background-50/80 py-2.5 pr-3 pl-9 font-mono text-[13px] text-foreground-950 placeholder:text-foreground-600 focus:border-primary-500/60"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-md border border-accent-500/40 bg-accent-500/10 px-3 py-2">
                  <i className="ri-error-warning-line mt-0.5 text-[13px] text-accent-500" />
                  <p className="min-w-0 font-mono text-[10px] leading-relaxed text-accent-500">
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-primary-500 px-4 py-3 font-mono text-[12px] font-bold whitespace-nowrap text-background-50 transition-colors hover:bg-primary-400"
              >
                <i className="ri-award-line text-base" />
                xác nhận mã code
              </button>

              <p className="text-center font-mono text-[9px] leading-relaxed text-foreground-600">
                Mã code chỉ có giá trị trong phiên quét hiện tại. Quét lại phiên mới sẽ đổi mã nhưng
                mệnh giá giữ nguyên.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}