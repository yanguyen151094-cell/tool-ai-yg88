import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function AdminLogin() {
  const { signInWithUsername, checkConnection } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);
  const [diag, setDiag] = useState<string[]>([]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const name = username.trim().toLowerCase();
    if (!/^[a-z0-9._-]{3,24}$/.test(name)) {
      setError(
        'Tên đăng nhập 3-24 ký tự, chỉ chữ thường không dấu, số, dấu chấm, gạch dưới hoặc gạch ngang.\nVí dụ: admin',
      );
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu cần từ 6 ký tự.');
      return;
    }

    setBusy(true);
    try {
      await signInWithUsername(name, password);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Đăng nhập thất bại.');
    } finally {
      setBusy(false);
    }
  };

  const handleCheck = async () => {
    setChecking(true);
    try {
      const lines = await checkConnection();
      setDiag(lines);
    } catch (caught) {
      setDiag([caught instanceof Error ? caught.message : 'Không kiểm tra được kết nối.']);
    } finally {
      setChecking(false);
    }
  };

  const inputClass =
    'w-full rounded-md border border-background-300/50 bg-background-50/70 px-3 py-2.5 text-[13px] text-foreground-950 placeholder:text-foreground-600 focus:border-primary-500/60';

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background-50 px-4 py-16">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
      <div className="relative w-full max-w-md rounded-lg border hairline bg-background-100/80 p-6 backdrop-blur md:p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md border border-primary-500/50 bg-primary-500/10 font-heading text-base font-bold text-primary-500">
            Y
          </span>
          <div>
            <p className="font-heading text-sm font-bold tracking-[0.16em] text-foreground-950">
              KHU QUẢN TRỊ
            </p>
            <p className="font-mono text-[10px] tracking-[0.18em] text-foreground-600 uppercase">
              admin console
            </p>
          </div>
        </div>

        <h1 className="mt-6 font-heading text-xl font-bold text-foreground-950">
          Đăng nhập quản trị viên
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-foreground-500">
          Chỉ cần tên đăng nhập và mật khẩu, không cần email. Tài khoản nhân viên do chủ web tạo và cấp
          quyền trong khu quản trị.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="admin-username"
              className="mb-1.5 block font-mono text-[10px] tracking-[0.14em] text-foreground-600 uppercase"
            >
              Tên đăng nhập
            </label>
            <div className="relative">
              <i className="ri-user-line pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[14px] text-foreground-600" />
              <input
                id="admin-username"
                type="text"
                name="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="admin"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="mb-1.5 block font-mono text-[10px] tracking-[0.14em] text-foreground-600 uppercase"
            >
              Mật khẩu
            </label>
            <div className="relative">
              <i className="ri-lock-line pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[14px] text-foreground-600" />
              <input
                id="admin-password"
                type="password"
                name="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="từ 6 ký tự"
                autoComplete="current-password"
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-md border border-accent-500/40 bg-accent-500/10 px-3 py-2">
              <i className="ri-error-warning-line mt-0.5 text-[13px] text-accent-500" />
              <p className="text-[11px] leading-relaxed whitespace-pre-line text-accent-500">
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-primary-500 px-4 py-3 font-mono text-[12px] font-bold whitespace-nowrap text-background-50 transition-colors hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? (
              <i className="ri-loader-4-line animate-spin text-base" />
            ) : (
              <i className="ri-shield-keyhole-line text-base" />
            )}
            {busy ? 'ĐANG KIỂM TRA...' : 'VÀO KHU QUẢN TRỊ'}
          </button>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10px] text-foreground-600">
          <button
            type="button"
            onClick={handleCheck}
            disabled={checking}
            className="flex cursor-pointer items-center gap-1 whitespace-nowrap text-foreground-500 transition-colors hover:text-primary-500 disabled:opacity-50"
          >
            <i className={checking ? 'ri-loader-4-line animate-spin' : 'ri-stethoscope-line'} />
            kiểm tra kết nối
          </button>
          <span className="flex items-center gap-1 whitespace-nowrap">
            <i className="ri-shield-check-line text-primary-500" />
            quyền admin cao nhất
          </span>
        </div>

        {diag.length > 0 && (
          <div className="mt-3 rounded-md border hairline bg-background-50/80 p-3">
            <p className="mb-1.5 font-mono text-[9px] tracking-[0.16em] text-foreground-600 uppercase">
              kết quả kiểm tra
            </p>
            <ul className="space-y-1 font-mono text-[10px] leading-relaxed text-foreground-500">
              {diag.map((line) => (
                <li key={line} className="break-all">
                  • {line}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between border-t hairline pt-4 font-mono text-[10px] text-foreground-600">
          <Link to="/" className="cursor-pointer transition-colors hover:text-primary-500">
            ← về trang chủ
          </Link>
          <Link to="/login" className="cursor-pointer transition-colors hover:text-primary-500">
            đăng nhập người chơi
          </Link>
        </div>
      </div>
    </div>
  );
}