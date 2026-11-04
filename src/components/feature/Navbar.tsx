import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { DEPOSIT_FALLBACK_PATH, useDepositUrl } from '@/lib/deposit';

const navLinks = [
  { href: '/', label: 'Trang chủ' },
  { href: '/games', label: 'Danh sách game' },
  { href: '/#pricing', label: 'Bảng giá' },
  { href: '/#faq', label: 'Hỏi đáp' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, isAdmin, signOut } = useAuth();
  const { url: depositUrl } = useDepositUrl(user?.id ?? null);

  const displayName = profile?.username || user?.email || null;
  const coins = Number(profile?.coins ?? 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setAccountOpen(false);
  }, [location.pathname, location.hash]);

  const handleLogout = async () => {
    setAccountOpen(false);
    setOpen(false);
    await signOut();
    navigate('/login');
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open
          ? 'border-b hairline bg-background-50/90 backdrop-blur-md'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 w-full items-center justify-between gap-4 px-4 md:h-[72px] md:px-6 lg:px-10">
        <Link to="/" className="flex shrink-0 items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md border border-primary-500/50 bg-primary-500/10 font-heading text-base font-bold text-primary-500 md:h-10 md:w-10">
            Y
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-heading text-sm font-bold tracking-[0.16em] text-foreground-950 md:text-base">
              TOOL AI YG88
            </span>
            <span className="mt-1 font-mono text-[9px] tracking-[0.2em] text-foreground-600 uppercase">
              ai predict console
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => {
            const active =
              link.href === '/'
                ? location.pathname === '/' && !location.hash
                : location.pathname + location.hash === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`rounded-md px-3 py-2 font-mono text-[12px] tracking-wide whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-primary-500/10 text-primary-500'
                    : 'text-foreground-400 hover:bg-background-100 hover:text-foreground-950'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <span className="hidden items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-3 py-1.5 font-mono text-[10px] tracking-[0.16em] text-primary-500 sm:flex">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-primary-500" />
            LIVE
          </span>

          {displayName ? (
            <>
              {depositUrl ? (
                <a
                  href={depositUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden cursor-pointer items-center gap-1.5 rounded-md bg-accent-500 px-3 py-1.5 font-mono text-[12px] font-bold whitespace-nowrap text-background-50 transition-colors hover:bg-accent-400 sm:flex"
                >
                  <i className="ri-wallet-3-line text-[14px]" />
                  Nạp tiền nhận coin
                  <i className="ri-arrow-right-up-line text-[12px]" />
                </a>
              ) : (
                <Link
                  to={DEPOSIT_FALLBACK_PATH}
                  className="hidden cursor-pointer items-center gap-1.5 rounded-md bg-accent-500 px-3 py-1.5 font-mono text-[12px] font-bold whitespace-nowrap text-background-50 transition-colors hover:bg-accent-400 sm:flex"
                >
                  <i className="ri-wallet-3-line text-[14px]" />
                  Nạp tiền nhận coin
                </Link>
              )}

              <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setAccountOpen((prev) => !prev)}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-primary-500/50 bg-primary-500/10 px-2.5 py-1.5 font-mono text-[12px] whitespace-nowrap text-primary-500 transition-colors hover:bg-primary-500/15"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500/20 font-heading text-[10px] font-bold uppercase">
                  {displayName.slice(0, 1)}
                </span>
                <span className="max-w-[92px] truncate">{displayName}</span>
                <span className="h-3.5 w-px bg-primary-500/30" />
                <span className="flex items-center gap-1 text-accent-500">
                  <i className="ri-copper-coin-line text-[12px]" />
                  {coins.toLocaleString('vi-VN')}
                </span>
                <i
                  className={`text-[12px] text-foreground-500 ${
                    accountOpen ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'
                  }`}
                />
              </button>

              {accountOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setAccountOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-60 rounded-lg border hairline bg-background-100 p-2">
                    <div className="rounded-md bg-background-50/70 px-3 py-2.5">
                      <p className="font-mono text-[10px] tracking-[0.14em] text-foreground-600 uppercase">
                        đang đăng nhập
                      </p>
                      <p className="mt-1 truncate font-heading text-[13px] font-semibold text-foreground-950">
                        {displayName}
                      </p>
                      <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px] text-accent-500">
                        <i className="ri-copper-coin-line text-[12px]" />
                        {coins.toLocaleString('vi-VN')} coin
                      </p>
                    </div>

                    <Link
                      to="/games"
                      className="mt-1 flex items-center gap-2 rounded-md px-3 py-2 font-mono text-[11px] text-foreground-300 transition-colors hover:bg-background-200/60 hover:text-foreground-950"
                    >
                      <i className="ri-live-line text-[13px] text-primary-500" />
                      danh sách game
                    </Link>

                    {depositUrl ? (
                      <a
                        href={depositUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-md px-3 py-2 font-mono text-[11px] text-accent-500 transition-colors hover:bg-accent-500/10"
                      >
                        <i className="ri-wallet-3-line text-[13px]" />
                        nạp tiền nhận coin
                      </a>
                    ) : (
                      <Link
                        to={DEPOSIT_FALLBACK_PATH}
                        className="flex items-center gap-2 rounded-md px-3 py-2 font-mono text-[11px] text-accent-500 transition-colors hover:bg-accent-500/10"
                      >
                        <i className="ri-wallet-3-line text-[13px]" />
                        nạp tiền nhận coin
                      </Link>
                    )}

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 rounded-md px-3 py-2 font-mono text-[11px] text-foreground-300 transition-colors hover:bg-background-200/60 hover:text-foreground-950"
                      >
                        <i className="ri-shield-keyhole-line text-[13px] text-primary-500" />
                        khu quản trị
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 font-mono text-[11px] whitespace-nowrap text-foreground-300 transition-colors hover:bg-accent-500/10 hover:text-accent-500"
                    >
                      <i className="ri-logout-box-r-line text-[13px]" />
                      đăng xuất
                    </button>
                  </div>
                </>
              )}
            </div>
            </>
          ) : (
            <Link
              to="/login"
              className="hidden items-center gap-2 rounded-md border border-primary-500/60 bg-primary-500/10 px-4 py-2 font-mono text-[12px] font-semibold whitespace-nowrap text-primary-500 transition-colors hover:bg-primary-500 hover:text-background-50 sm:flex"
            >
              Đăng nhập
              <i className="ri-arrow-right-line text-[13px]" />
            </Link>
          )}

          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border hairline text-foreground-300 transition-colors hover:text-primary-500 lg:hidden"
            aria-label="Mở menu"
          >
            <i className={`text-lg ${open ? 'ri-close-line' : 'ri-menu-3-line'}`} />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t hairline bg-background-50/95 px-4 pb-5 pt-2 backdrop-blur-md lg:hidden">
          <div className="flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="border-b border-primary-500/10 py-3 font-mono text-[13px] text-foreground-300 transition-colors last:border-0 hover:text-primary-500"
              >
                <span className="mr-2 text-primary-500/60">$</span>
                {link.label}
              </Link>
            ))}
          </div>

          {displayName ? (
            <div className="mt-4 rounded-md border border-primary-500/30 bg-background-100/70 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] tracking-[0.14em] text-foreground-600 uppercase">
                    đang đăng nhập
                  </p>
                  <p className="mt-1 truncate font-heading text-[13px] font-semibold text-foreground-950">
                    {displayName}
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-1.5 rounded border border-accent-500/30 bg-accent-500/10 px-2.5 py-1.5 font-mono text-[11px] text-accent-500">
                  <i className="ri-copper-coin-line text-[12px]" />
                  {coins.toLocaleString('vi-VN')}
                </span>
              </div>

              <div className="mt-3 flex flex-col gap-2">
                {depositUrl ? (
                  <a
                    href={depositUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-md bg-accent-500 px-4 py-2.5 font-mono text-[12px] font-bold whitespace-nowrap text-background-50"
                  >
                    <i className="ri-wallet-3-line" />
                    nạp tiền nhận coin
                  </a>
                ) : (
                  <Link
                    to={DEPOSIT_FALLBACK_PATH}
                    className="flex items-center justify-center gap-2 rounded-md bg-accent-500 px-4 py-2.5 font-mono text-[12px] font-bold whitespace-nowrap text-background-50"
                  >
                    <i className="ri-wallet-3-line" />
                    nạp tiền nhận coin
                  </Link>
                )}
              </div>

              <div className="mt-2 flex items-center gap-2">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex flex-1 items-center justify-center gap-2 rounded-md border border-primary-500/40 px-3 py-2 font-mono text-[12px] whitespace-nowrap text-primary-500"
                  >
                    <i className="ri-shield-keyhole-line" />
                    quản trị
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-accent-500/40 px-3 py-2 font-mono text-[12px] whitespace-nowrap text-accent-500"
                >
                  <i className="ri-logout-box-r-line" />
                  đăng xuất
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-primary-500 px-4 py-3 font-mono text-[13px] font-semibold whitespace-nowrap text-background-50"
            >
              Đăng nhập
              <i className="ri-arrow-right-line" />
            </Link>
          )}
        </div>
      )}
    </header>
  );
}