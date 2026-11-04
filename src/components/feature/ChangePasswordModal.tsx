import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { changeOwnPassword } from '@/lib/password';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

type Props = {
  open: boolean;
  accountName?: string | null;
  onClose: () => void;
};

const messageOf = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export default function ChangePasswordModal({ open, accountName, onClose }: Props) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
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
      setCurrent('');
      setNext('');
      setConfirm('');
      setError('');
      setDone(false);
      setShow(false);
    }
  }, [open]);

  if (!open) return null;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (current.length < 6) {
      setError('Anh nhập mật khẩu hiện tại giúp em.');
      return;
    }
    if (next.length < 6) {
      setError('Mật khẩu mới cần ít nhất 6 ký tự.');
      return;
    }
    if (next !== confirm) {
      setError('Hai lần nhập mật khẩu mới chưa giống nhau.');
      return;
    }
    setBusy(true);
    try {
      await changeOwnPassword(current, next);
      setDone(true);
    } catch (caught) {
      setError(messageOf(caught, 'Chưa đổi được mật khẩu.'));
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    'w-full rounded-md border border-background-300/50 bg-background-50/80 px-3 py-2.5 font-mono text-sm text-foreground-950 placeholder:text-foreground-600 focus:border-primary-500/60';

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto px-3 py-6 md:items-center">
      <button
        type="button"
        aria-label="Đóng"
        onClick={onClose}
        className="fixed inset-0 cursor-default bg-background-50/90 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-lg border border-primary-500/35 bg-background-100 term-glow">
        <div className="flex items-center justify-between gap-3 border-b hairline px-4 py-2.5">
          <div className="min-w-0">
            <p className="truncate font-mono text-[10px] tracking-[0.18em] text-primary-500 uppercase">
              passwd --change
            </p>
            <p className="mt-0.5 truncate font-mono text-[9px] text-foreground-600">
              {accountName ? `tài khoản ${accountName}` : 'đổi mật khẩu tài khoản đang đăng nhập'}
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

        <div className="p-4 md:p-5">
          {done ? (
            <div className="rounded-md border border-primary-500/40 bg-primary-500/10 px-4 py-6 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-primary-500/50 bg-background-100/80">
                <i className="ri-checkbox-circle-fill text-xl text-primary-500" />
              </span>
              <p className="mt-3 font-mono text-[10px] tracking-[0.2em] text-primary-500 uppercase">
                đổi mật khẩu thành công
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground-300">
                Lần đăng nhập sau anh dùng <b className="text-foreground-950">mật khẩu mới</b> vừa
                đặt. Hệ thống đã thử đăng nhập lại bằng mật khẩu này nên chắc chắn dùng được.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 w-full cursor-pointer rounded-md bg-primary-500 px-4 py-2.5 font-mono text-[11px] font-bold whitespace-nowrap text-background-50 transition-colors hover:bg-primary-400"
              >
                xong
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label
                  htmlFor="current-password"
                  className="mb-1.5 block font-mono text-[10px] tracking-[0.16em] text-foreground-600 uppercase"
                >
                  mật khẩu hiện tại
                </label>
                <input
                  id="current-password"
                  value={current}
                  onChange={(event) => {
                    setCurrent(event.target.value);
                    setError('');
                  }}
                  type={show ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="mật khẩu đang dùng"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="next-password"
                  className="mb-1.5 block font-mono text-[10px] tracking-[0.16em] text-foreground-600 uppercase"
                >
                  mật khẩu mới
                </label>
                <input
                  id="next-password"
                  value={next}
                  onChange={(event) => {
                    setNext(event.target.value);
                    setError('');
                  }}
                  type={show ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="ít nhất 6 ký tự"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-1.5 block font-mono text-[10px] tracking-[0.16em] text-foreground-600 uppercase"
                >
                  nhập lại mật khẩu mới
                </label>
                <input
                  id="confirm-password"
                  value={confirm}
                  onChange={(event) => {
                    setConfirm(event.target.value);
                    setError('');
                  }}
                  type={show ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="gõ lại cho chắc"
                  className={inputClass}
                />
              </div>

              <button
                type="button"
                onClick={() => setShow((prev) => !prev)}
                className="flex cursor-pointer items-center gap-1.5 font-mono text-[10px] whitespace-nowrap text-foreground-500 transition-colors hover:text-primary-500"
              >
                <i className={show ? 'ri-eye-off-line' : 'ri-eye-line'} />
                {show ? 'ẩn mật khẩu' : 'hiện mật khẩu'}
              </button>

              {error && (
                <div className="flex items-start gap-2 rounded-md border border-accent-500/40 bg-accent-500/10 px-3 py-2">
                  <i className="ri-error-warning-line mt-0.5 text-[13px] text-accent-500" />
                  <p className="min-w-0 font-mono text-[10px] leading-relaxed whitespace-pre-line text-accent-500">
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-primary-500 px-4 py-3 font-mono text-[12px] font-bold whitespace-nowrap text-background-50 transition-colors hover:bg-primary-400 disabled:opacity-60"
              >
                <i className={busy ? 'ri-loader-4-line animate-spin' : 'ri-lock-password-line'} />
                {busy ? 'đang đổi…' : 'đổi mật khẩu'}
              </button>

              <p className="font-mono text-[9px] leading-relaxed text-foreground-600">
                Máy chủ kiểm tra mật khẩu hiện tại trước, sau đó thử đăng nhập lại bằng mật khẩu
                mới để chắc chắn lần sau anh vào được.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}