import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import ChangePasswordModal from '@/components/feature/ChangePasswordModal';
import AdminLogin from './components/AdminLogin';
import GamesPanel from './components/GamesPanel';
import UsersPanel from './components/UsersPanel';
import ContentPanel from './components/ContentPanel';
import BaccaratPanel from './components/BaccaratPanel';
import CreditPanel from './components/CreditPanel';
import StaffPanel from './components/StaffPanel';
import AgencyPanel from './components/AgencyPanel';
import BookmakersPanel from './components/BookmakersPanel';
import DepositHistoryWindow from './components/DepositHistoryWindow';

type View =
  | 'games'
  | 'users'
  | 'baccarat'
  | 'content'
  | 'credit'
  | 'staff'
  | 'agency'
  | 'bookmakers'
  | 'deposits';

type MenuItem = {
  key: View;
  label: string;
  staffLabel?: string;
  icon: string;
  hint: string;
  staffHint?: string;
  access: 'owner' | 'all' | 'deposit';
};

const menu: MenuItem[] = [
  {
    key: 'credit',
    label: 'Cộng điểm',
    icon: 'ri-coins-line',
    hint: 'cộng điểm cho khách',
    staffHint: 'cộng điểm cho khách của tôi',
    access: 'all',
  },
  {
    key: 'users',
    label: 'Người dùng',
    staffLabel: 'Khách của tôi',
    icon: 'ri-group-line',
    hint: 'toàn bộ khách & đại lý',
    staffHint: 'khách qua link của tôi',
    access: 'all',
  },
  {
    key: 'agency',
    label: 'Link đại lý',
    icon: 'ri-links-line',
    hint: 'miền đại lý từng admin',
    staffHint: 'link đăng ký của tôi',
    access: 'all',
  },
  {
    key: 'deposits',
    label: 'Lịch sử nạp tiền',
    icon: 'ri-history-line',
    hint: 'xem & sửa giao dịch nạp',
    access: 'deposit',
  },
  { key: 'games', label: 'Quản lý game', icon: 'ri-gamepad-line', hint: 'phòng & tỷ lệ', access: 'owner' },
  { key: 'bookmakers', label: 'Nhà cái & logo', icon: 'ri-building-4-line', hint: 'thêm nhà cái, thay logo', access: 'owner' },
  { key: 'baccarat', label: 'Tài khoản Baccarat', icon: 'ri-key-2-line', hint: 'tài khoản khách gửi', access: 'owner' },
  { key: 'staff', label: 'Phân quyền admin', icon: 'ri-shield-user-line', hint: 'admin & đại lý', access: 'owner' },
  { key: 'content', label: 'Nội dung web', icon: 'ri-file-text-line', hint: 'chữ & ảnh', access: 'owner' },
];

export default function AdminPage() {
  const {
    user,
    profile,
    isAdmin,
    adminRole,
    canManageDeposits,
    loading,
    accessChecked,
    signOut,
  } = useAuth();
  const [view, setView] = useState<View>('games');
  const [menuOpen, setMenuOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-50">
        <div className="flex items-center gap-2 font-mono text-[12px] text-foreground-500">
          <i className="ri-loader-4-line animate-spin" />
          đang kiểm tra phiên đăng nhập...
        </div>
      </div>
    );
  }

  if (!user) return <AdminLogin />;

  if (!accessChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-50">
        <div className="flex items-center gap-2 font-mono text-[12px] text-foreground-500">
          <i className="ri-loader-4-line animate-spin" />
          đang tải quyền truy cập...
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background-50 px-4">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
        <div className="relative w-full max-w-md rounded-lg border hairline bg-background-100/80 p-6 text-center">
          <i className="ri-shield-cross-line text-3xl text-accent-500" />
          <h1 className="mt-4 font-heading text-lg font-bold text-foreground-950">
            Tài khoản chưa có quyền quản trị
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-foreground-500">
            Bạn đang đăng nhập bằng <b className="text-foreground-300">{user.email}</b>. Hãy nhờ chủ
            website cấp quyền admin cho email này trong Supabase, sau đó tải lại trang.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-primary-500/40 px-3 py-2 font-mono text-[11px] whitespace-nowrap text-primary-500 transition-colors hover:bg-primary-500/10"
            >
              <i className="ri-refresh-line" />
              tải lại
            </button>
            <button
              type="button"
              onClick={() => signOut()}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border hairline px-3 py-2 font-mono text-[11px] whitespace-nowrap text-foreground-300 transition-colors hover:text-accent-500"
            >
              <i className="ri-logout-box-r-line" />
              đăng xuất
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = adminRole === 'owner';
  const visibleMenu = menu
    .filter((item) => {
      if (item.access === 'all') return true;
      if (item.access === 'owner') return isOwner;
      return canManageDeposits;
    })
    .map((item) => ({
      ...item,
      label: isOwner ? item.label : item.staffLabel || item.label,
      hint: isOwner ? item.hint : item.staffHint || item.hint,
    }));
  const currentView: View = visibleMenu.some((item) => item.key === view)
    ? view
    : visibleMenu[0].key;
  const activeMenu = visibleMenu.find((item) => item.key === currentView) ?? visibleMenu[0];

  return (
    <div className="min-h-screen bg-background-50">
      <header className="sticky top-0 z-40 border-b hairline bg-background-100/90 backdrop-blur">
        <div className="flex h-14 w-full items-center justify-between gap-3 px-4 md:h-16 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link to="/" className="flex shrink-0 items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-md border border-primary-500/50 bg-primary-500/10 font-heading text-[13px] font-bold text-primary-500">
                Y
              </span>
              <span className="hidden flex-col leading-none sm:flex">
                <span className="font-heading text-[11px] font-bold tracking-[0.16em] text-foreground-950">
                  KHU QUẢN TRỊ
                </span>
                <span className="mt-1 font-mono text-[9px] tracking-[0.16em] text-foreground-600 uppercase">
                  tool ai yg88
                </span>
              </span>
            </Link>
            <span className="hidden items-center gap-1.5 rounded-full border border-primary-500/30 bg-primary-500/10 px-2.5 py-1 font-mono text-[9px] tracking-[0.14em] text-primary-500 uppercase md:flex">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-primary-500" />
              {isOwner ? 'chủ web' : 'admin đại lý'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-md border hairline bg-background-50/60 px-2.5 py-1.5 font-mono text-[10px] sm:flex">
              <i className="ri-user-settings-line text-primary-500" />
              <span className="max-w-[140px] truncate text-foreground-300">
                {profile?.username || user.email}
              </span>
            </div>
            <Link
              to="/games"
              className="hidden cursor-pointer items-center gap-1.5 rounded-md border border-primary-500/40 px-2.5 py-1.5 font-mono text-[10px] whitespace-nowrap text-primary-500 transition-colors hover:bg-primary-500/10 md:flex"
            >
              <i className="ri-gamepad-line" />
              chơi game
            </Link>
            <Link
              to="/"
              className="hidden cursor-pointer items-center gap-1.5 rounded-md border hairline px-2.5 py-1.5 font-mono text-[10px] whitespace-nowrap text-foreground-400 transition-colors hover:text-primary-500 sm:flex"
            >
              <i className="ri-external-link-line" />
              xem web
            </Link>
            <button
              type="button"
              onClick={() => setPasswordOpen(true)}
              className="hidden cursor-pointer items-center gap-1.5 rounded-md border hairline px-2.5 py-1.5 font-mono text-[10px] whitespace-nowrap text-foreground-400 transition-colors hover:text-primary-500 sm:flex"
            >
              <i className="ri-lock-password-line" />
              đổi mật khẩu
            </button>
            <button
              type="button"
              onClick={() => signOut()}
              className="flex cursor-pointer items-center gap-1.5 rounded-md border border-accent-500/40 px-2.5 py-1.5 font-mono text-[10px] whitespace-nowrap text-accent-500 transition-colors hover:bg-accent-500/10"
            >
              <i className="ri-logout-box-r-line" />
              thoát
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border hairline text-foreground-300 lg:hidden"
              aria-label="Mở menu quản trị"
            >
              <i className={`text-base ${menuOpen ? 'ri-close-line' : 'ri-menu-3-line'}`} />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t hairline px-4 py-3 lg:hidden">
            <div className="flex flex-col gap-1">
              {visibleMenu.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setView(item.key);
                    if (item.key === 'deposits') setDepositOpen(true);
                    setMenuOpen(false);
                  }}
                  className={`flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left font-mono text-[12px] transition-colors ${
                    currentView === item.key
                      ? 'bg-primary-500/15 text-primary-500'
                      : 'text-foreground-400 hover:text-foreground-950'
                  }`}
                >
                  <i className={`${item.icon} text-sm`} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <div className="flex w-full">
        <aside className="hidden w-56 shrink-0 border-r hairline lg:block">
          <div className="sticky top-16 p-3">
            <p className="mb-2 px-3 font-mono text-[10px] tracking-[0.18em] text-foreground-600 uppercase">
              bảng điều khiển
            </p>
            <nav className="flex flex-col gap-1">
              {visibleMenu.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setView(item.key);
                    if (item.key === 'deposits') setDepositOpen(true);
                  }}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2.5 text-left transition-colors ${
                    currentView === item.key
                      ? 'bg-primary-500/15 text-primary-500'
                      : 'text-foreground-400 hover:bg-background-100 hover:text-foreground-950'
                  }`}
                >
                  <i className={`${item.icon} text-sm`} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono text-[12px]">{item.label}</span>
                    <span className="block truncate font-mono text-[9px] text-foreground-600">
                      {item.hint}
                    </span>
                  </span>
                </button>
              ))}
            </nav>

            <div className="mt-4 rounded-md border hairline bg-background-100/60 p-3">
              <p className="font-mono text-[9px] tracking-[0.14em] text-foreground-600 uppercase">
                trạng thái
              </p>
              <div className="mt-2 space-y-1.5 font-mono text-[10px] text-foreground-500">
                <p className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                  CSDL: kết nối
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                  ảnh: bucket media
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
                  quyền: {isOwner ? 'chủ web' : 'admin đại lý'}
                </p>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 md:px-6 md:py-8">
          <div className="mb-4 flex items-center gap-2 font-mono text-[10px] text-foreground-600">
            <span className="text-primary-500">admin</span>
            <i className="ri-arrow-right-s-line" />
            <span className="text-foreground-400">{activeMenu.label}</span>
          </div>

          {currentView === 'credit' && <CreditPanel />}
          {currentView === 'games' && <GamesPanel />}
          {currentView === 'bookmakers' && <BookmakersPanel />}
          {currentView === 'deposits' && (
            <div className="flex flex-col items-center rounded-lg border hairline bg-background-100/60 px-6 py-16 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-primary-500/40 bg-primary-500/10 text-primary-500">
                <i className="ri-history-line text-xl" />
              </span>
              <h2 className="mt-4 font-heading text-lg font-bold text-foreground-950">
                Lịch sử nạp tiền
              </h2>
              <p className="mt-1 max-w-sm text-sm text-foreground-500">
                Xem, thêm, sửa, xóa giao dịch nạp trong một cửa sổ riêng.
              </p>
              <button
                type="button"
                onClick={() => setDepositOpen(true)}
                className="mt-5 flex cursor-pointer items-center gap-2 rounded-md bg-primary-500 px-5 py-2.5 font-mono text-[12px] font-bold whitespace-nowrap text-background-50 transition-colors hover:bg-primary-400"
              >
                <i className="ri-window-line" />
                mở cửa sổ lịch sử nạp
              </button>
            </div>
          )}
          {currentView === 'users' && <UsersPanel />}
          {currentView === 'agency' && <AgencyPanel />}
          {currentView === 'baccarat' && <BaccaratPanel />}
          {currentView === 'staff' && <StaffPanel />}
          {currentView === 'content' && <ContentPanel />}
        </main>
      </div>

      <DepositHistoryWindow
        open={depositOpen && currentView === 'deposits'}
        onClose={() => setDepositOpen(false)}
      />

      <ChangePasswordModal
        open={passwordOpen}
        accountName={profile?.username || user.email}
        onClose={() => setPasswordOpen(false)}
      />
    </div>
  );
}