import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import TermWindow from '@/components/base/TermWindow';
import WinTicker from '@/components/feature/WinTicker';
import { winners } from '@/mocks/winners';
import { useAuth } from '@/hooks/useAuth';
import CodeStreamBox from '@/pages/games/components/CodeStreamBox';
import { supabase } from '@/lib/supabase';
import { isValidPhone, isValidUsername, normalizeTelegram } from '@/lib/phone';

type Mode = 'login' | 'register';

const messageOf = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, signUpWithContact, signInDemo } = useAuth();
  const refCode = (searchParams.get('ref') ?? '').trim().toLowerCase();
  const [mode, setMode] = useState<Mode>(refCode ? 'register' : 'login');
  const [agentName, setAgentName] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  useEffect(() => {
    if (!refCode) {
      setAgentName('');
      return;
    }
    let active = true;
    const loadAgent = async () => {
      try {
        const { data } = await supabase
          .from('admin_users')
          .select('username, ref_code')
          .ilike('ref_code', refCode)
          .limit(1)
          .maybeSingle();
        if (active) setAgentName((data?.username as string | null) ?? '');
      } catch {
        if (active) setAgentName('');
      }
    };
    loadAgent();
    return () => {
      active = false;
    };
  }, [refCode]);

  const handleDemo = async () => {
    setError('');
    setInfo('');
    setDemoLoading(true);
    try {
      await signInDemo();
      navigate('/games');
    } catch (caught) {
      setError(messageOf(caught, 'Chưa vào được tài khoản demo, anh thử lại giúp em.'));
    } finally {
      setDemoLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setInfo('');

    const data = new FormData(event.currentTarget);
    const account = String(data.get('account') ?? '').trim();
    const password = String(data.get('password') ?? '');
    const username = String(data.get('username') ?? '').trim();
    const phone = String(data.get('phone') ?? '').trim();
    const telegram = normalizeTelegram(String(data.get('telegram') ?? ''));

    if (password.length < 6) {
      setError('Mật khẩu cần ít nhất 6 ký tự.');
      return;
    }

    if (mode === 'login') {
      if (account.length < 3) {
        setError('Nhập tên đăng nhập hoặc số điện thoại để đăng nhập.');
        return;
      }
      setLoading(true);
      try {
        await signIn(account, password);
        navigate('/games');
      } catch (caught) {
        setError(messageOf(caught, 'Không thể đăng nhập, anh thử lại giúp em.'));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!isValidUsername(username)) {
      setError('Tên đăng nhập cần ít nhất 3 ký tự (chữ hoặc số).');
      return;
    }
    if (phone && !isValidPhone(phone)) {
      setError('Số điện thoại chưa đúng. Anh nhập 10 số, ví dụ 0901234567.');
      return;
    }
    if (!phone && !telegram) {
      setError(
        'Cần có số điện thoại hoặc Telegram để admin liên hệ.\nAnh điền một trong hai giúp em nhé.',
      );
      return;
    }

    setLoading(true);
    try {
      await signUpWithContact({ username, password, phone, telegram, refCode });
      navigate('/games');
    } catch (caught) {
      setError(messageOf(caught, 'Không tạo được tài khoản, anh thử lại giúp em.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background-50">
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary-500/10 blur-[120px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 md:px-6 lg:px-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md border border-primary-500/50 bg-primary-500/10 font-heading text-base font-bold text-primary-500">
              Y
            </span>
            <span className="font-heading text-sm font-bold tracking-[0.16em] text-foreground-950">
              TOOL AI YG88
            </span>
          </Link>
          <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] text-foreground-500">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-primary-500" />
            2.642 người đang online
          </span>
        </div>

        <div className="grid flex-1 grid-cols-1 items-center gap-10 py-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6">
            <p className="mb-3 font-mono text-[12px] text-foreground-500">
              <span className="text-primary-500">$</span> ssh ai@predict.local
            </p>
            <h1 className="font-heading text-[36px] leading-[1.05] font-bold tracking-tight text-foreground-950 sm:text-5xl lg:text-[58px]">
              AI <span className="text-accent-500 text-glow-accent">ĐỌC NHỊP</span>
              <br />
              SÒNG BÀI
              <span className="ml-2 inline-block h-[0.7em] w-[0.4em] animate-caret bg-primary-500 align-baseline" />
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-foreground-400">
              Đăng nhập để xem bảng phân tích Baccarat, Nổ hũ và Slot theo thời gian thực. Dữ liệu
              tham khảo, quyết định thuộc về bạn.
            </p>

            <div className="mt-6">
              <CodeStreamBox
                name={mode === 'login' ? 'phiên đăng nhập' : 'phiên đăng ký'}
                domain="yg88"
                variant="auth"
                compact
              />
            </div>

            <div className="mt-7 rounded-md border hairline bg-background-100/70 p-3">
              <p className="mb-2 font-mono text-[10px] tracking-[0.16em] text-foreground-600 uppercase">
                tail -f /var/log/wins.log
              </p>
              <WinTicker items={winners} variant="hero" />
            </div>

            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 font-mono text-[10px] tracking-[0.14em] text-foreground-600 uppercase">
              <span className="flex items-center gap-1.5">
                <i className="ri-shield-check-line text-primary-500" /> ssl 1.3
              </span>
              <span className="flex items-center gap-1.5">
                <i className="ri-cpu-line text-primary-500" /> model v3.2
              </span>
              <span className="flex items-center gap-1.5">
                <i className="ri-time-line text-primary-500" /> 24/7
              </span>
            </div>
          </div>

          <div className="lg:col-span-6 lg:pl-6">
            <TermWindow
              title={mode === 'login' ? 'auth --login' : 'auth --register'}
              className="mx-auto w-full max-w-md"
              bodyClassName="p-5 md:p-6"
            >
              <div className="mb-5 grid grid-cols-2 gap-1 rounded-md border hairline bg-background-50/60 p-1">
                {(['login', 'register'] as Mode[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setMode(item);
                      setError('');
                      setInfo('');
                    }}
                    className={`cursor-pointer rounded-full py-2 font-mono text-[11px] whitespace-nowrap transition-colors ${
                      mode === item
                        ? 'bg-primary-500 text-background-50'
                        : 'text-foreground-500 hover:text-foreground-950'
                    }`}
                  >
                    {item === 'login' ? 'Đăng nhập' : 'Đăng ký'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-3" noValidate>
                {mode === 'login' ? (
                  <div>
                    <label
                      htmlFor="account"
                      className="mb-1.5 block font-mono text-[10px] tracking-[0.16em] text-foreground-600 uppercase"
                    >
                      tên đăng nhập hoặc số điện thoại
                    </label>
                    <input
                      id="account"
                      name="account"
                      type="text"
                      autoComplete="username"
                      placeholder="vd: minhpro hoặc 0901234567"
                      className="w-full rounded-md border hairline bg-background-50/80 px-3 py-2.5 font-mono text-sm text-foreground-950 placeholder:text-foreground-600 focus:border-primary-500/60"
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <label
                        htmlFor="username"
                        className="mb-1.5 block font-mono text-[10px] tracking-[0.16em] text-foreground-600 uppercase"
                      >
                        tên đăng nhập
                      </label>
                      <div className="relative">
                        <i className="ri-user-3-line pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[15px] text-primary-500" />
                        <input
                          id="username"
                          name="username"
                          type="text"
                          autoComplete="nickname"
                          placeholder="tên thường, vd: minhpro"
                          className="w-full rounded-md border hairline bg-background-50/80 py-2.5 pr-3 pl-9 font-mono text-sm text-foreground-950 placeholder:text-foreground-600 focus:border-primary-500/60"
                        />
                      </div>
                      <p className="mt-1 font-mono text-[9px] leading-relaxed text-foreground-600">
                        đặt tên bình thường, ít nhất 3 ký tự. Tên này dùng để đăng nhập.
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="mb-1.5 flex items-center justify-between gap-2 font-mono text-[10px] tracking-[0.16em] text-foreground-600 uppercase"
                      >
                        <span>số điện thoại</span>
                        <span className="text-primary-500 normal-case">bắt buộc *</span>
                      </label>
                      <div className="relative">
                        <i className="ri-smartphone-line pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[15px] text-primary-500" />
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel"
                          placeholder="0901234567"
                          className="w-full rounded-md border hairline bg-background-50/80 py-2.5 pr-3 pl-9 font-mono text-sm text-foreground-950 placeholder:text-foreground-600 focus:border-primary-500/60"
                        />
                      </div>
                      <p className="mt-1 font-mono text-[9px] leading-relaxed text-foreground-600">
                        không có SĐT thì điền Telegram bên dưới là được.
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="telegram"
                        className="mb-1.5 flex items-center justify-between gap-2 font-mono text-[10px] tracking-[0.16em] text-foreground-600 uppercase"
                      >
                        <span>telegram</span>
                        <span className="text-foreground-600/80 normal-case">nếu có</span>
                      </label>
                      <div className="relative">
                        <i className="ri-telegram-line pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[15px] text-primary-500" />
                        <input
                          id="telegram"
                          name="telegram"
                          type="text"
                          autoComplete="off"
                          placeholder="@ten_telegram"
                          className="w-full rounded-md border hairline bg-background-50/80 py-2.5 pr-3 pl-9 font-mono text-sm text-foreground-950 placeholder:text-foreground-600 focus:border-primary-500/60"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block font-mono text-[10px] tracking-[0.16em] text-foreground-600 uppercase"
                  >
                    mật khẩu
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    placeholder="ít nhất 6 ký tự"
                    className="w-full rounded-md border hairline bg-background-50/80 px-3 py-2.5 font-mono text-sm text-foreground-950 placeholder:text-foreground-600 focus:border-primary-500/60"
                  />
                </div>

                {mode === 'register' && refCode && (
                  <div className="flex items-start gap-2 rounded border border-secondary-500/40 bg-secondary-500/10 px-3 py-2">
                    <i className="ri-links-line mt-0.5 text-[13px] text-secondary-500" />
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] leading-relaxed text-secondary-500">
                        Bạn đang đăng ký qua đại lý{' '}
                        <strong>{agentName || refCode}</strong>. Tài khoản sau khi tạo sẽ thuộc đại
                        lý này.
                      </p>
                    </div>
                  </div>
                )}

                {mode === 'register' && (
                  <div className="flex items-start gap-2 rounded border border-primary-500/30 bg-primary-500/10 px-3 py-2">
                    <i className="ri-shield-check-line mt-0.5 text-[13px] text-primary-500" />
                    <p className="font-mono text-[10px] leading-relaxed text-primary-500">
                      Bắt buộc có <strong>số điện thoại</strong> hoặc <strong>Telegram</strong> để
                      admin liên hệ. Đăng ký không cần email, không cần mã xác nhận — vào chơi ngay.
                    </p>
                  </div>
                )}

                {info && (
                  <div className="flex items-start gap-2 rounded border border-primary-500/30 bg-primary-500/10 px-3 py-2">
                    <i className="ri-mail-check-line mt-0.5 text-[13px] text-primary-500" />
                    <p className="font-mono text-[10px] leading-relaxed text-primary-500">{info}</p>
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-2 rounded border border-accent-500/40 bg-accent-500/10 px-3 py-2">
                    <i className="ri-error-warning-line mt-0.5 text-[13px] text-accent-500" />
                    <p className="font-mono text-[11px] leading-relaxed whitespace-pre-line text-accent-500">
                      {error}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-primary-500 px-4 py-3 font-mono text-[13px] font-bold whitespace-nowrap text-background-50 transition-colors hover:bg-primary-400 disabled:cursor-wait disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <i className="ri-loader-4-line animate-spin text-base" />
                      đang xác thực…
                    </>
                  ) : (
                    <>
                      <i className="ri-login-box-line text-base" />
                      {mode === 'login' ? '[ ĐĂNG NHẬP ]' : '[ TẠO TÀI KHOẢN ]'}
                    </>
                  )}
                </button>

                {mode === 'login' && (
                  <p className="flex items-start gap-1.5 font-mono text-[9px] leading-relaxed text-foreground-600">
                    <i className="ri-shield-keyhole-line mt-0.5 text-[11px] text-secondary-500" />
                    <span>
                      Quản trị viên cũng đăng nhập được tại đây bằng tên không dấu (vd:{' '}
                      <strong className="text-secondary-500">admin</strong>,{' '}
                      <strong className="text-secondary-500">yamato123</strong>) và mật khẩu quản
                      trị.
                    </span>
                  </p>
                )}
              </form>

              <div className="mt-3 rounded-md border border-primary-500/30 bg-primary-500/5 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] text-primary-500 uppercase">
                      <i className="ri-flask-line text-[12px]" /> tài khoản demo
                    </p>
                    <p className="mt-1 font-mono text-[10px] leading-relaxed text-foreground-600">
                      demo@yg88.local · demo123456
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDemo}
                    disabled={demoLoading}
                    className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-primary-500/40 bg-background-50/80 px-3 py-2 font-mono text-[11px] whitespace-nowrap text-primary-500 transition-colors hover:bg-primary-500/10 disabled:cursor-wait disabled:opacity-60"
                  >
                    {demoLoading ? (
                      <i className="ri-loader-4-line animate-spin text-[13px]" />
                    ) : (
                      <i className="ri-play-circle-line text-[13px]" />
                    )}
                    {demoLoading ? 'đang vào…' : 'vào thử'}
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between font-mono text-[10px] text-foreground-600">
                <span>continue as guest?</span>
                <Link
                  to="/games"
                  className="text-primary-500 transition-colors hover:text-primary-400"
                >
                  xem bảng game →
                </Link>
              </div>
            </TermWindow>

            <p className="mx-auto mt-4 max-w-md text-center font-mono text-[10px] leading-relaxed text-foreground-600">
              Bằng việc đăng nhập, bạn xác nhận đã đủ 18 tuổi và đồng ý với điều khoản sử dụng.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}