import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { href: '/', label: 'Trang chủ' },
  { href: '/games', label: 'Danh sách game' },
  { href: '/#pricing', label: 'Bảng giá' },
  { href: '/#faq', label: 'Hỏi đáp' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

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
          <Link
            to="/login"
            className="hidden items-center gap-2 rounded-md border border-primary-500/60 bg-primary-500/10 px-4 py-2 font-mono text-[12px] font-semibold whitespace-nowrap text-primary-500 transition-colors hover:bg-primary-500 hover:text-background-50 sm:flex"
          >
            Đăng nhập
            <i className="ri-arrow-right-line text-[13px]" />
          </Link>
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
          <Link
            to="/login"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-primary-500 px-4 py-3 font-mono text-[13px] font-semibold whitespace-nowrap text-background-50"
          >
            Đăng nhập
            <i className="ri-arrow-right-line" />
          </Link>
        </div>
      )}
    </header>
  );
}