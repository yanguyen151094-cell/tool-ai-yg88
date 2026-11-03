import { Link } from 'react-router-dom';

const columns = [
  {
    title: 'Sản phẩm',
    links: [
      { label: 'Danh sách game', href: '/games' },
      { label: 'Bảng giá coin', href: '/#pricing' },
      { label: 'Cách hoạt động', href: '/#how' },
      { label: 'Đăng nhập', href: '/login' },
    ],
  },
  {
    title: 'Chế độ',
    links: [
      { label: 'Baccarat', href: '/games' },
      { label: 'Nổ hũ', href: '/games' },
      { label: 'Slot PG Soft', href: '/games' },
      { label: 'Slot Jili', href: '/games' },
    ],
  },
  {
    title: 'Hỗ trợ',
    links: [
      { label: 'Câu hỏi thường gặp', href: '/#faq' },
      { label: 'Điều khoản sử dụng', href: '/#faq' },
      { label: 'Chính sách bảo mật', href: '/#faq' },
      { label: 'Liên hệ', href: '/#faq' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t hairline bg-background-100">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
      <div className="relative mx-auto w-full max-w-7xl px-4 py-14 md:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md border border-primary-500/50 bg-primary-500/10 font-heading text-base font-bold text-primary-500">
                Y
              </span>
              <div>
                <p className="font-heading text-base font-bold tracking-[0.16em] text-foreground-950">
                  TOOL AI YG88
                </p>
                <p className="font-mono text-[10px] tracking-[0.2em] text-foreground-600 uppercase">
                  ai predict console
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-foreground-500">
              Bảng điều khiển phân tích dữ liệu công khai cho Baccarat, Nổ hũ và Slot. Toàn bộ chỉ số
              mang tính tham khảo, không đảm bảo kết quả và không thay thế quyết định của bạn.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {[
                { icon: 'ri-telegram-line', label: 'Telegram' },
                { icon: 'ri-facebook-line', label: 'Facebook' },
                { icon: 'ri-mail-line', label: 'Email' },
                { icon: 'ri-discord-line', label: 'Discord' },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#faq"
                  aria-label={social.label}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border hairline text-foreground-500 transition-colors hover:border-primary-500/60 hover:text-primary-500"
                >
                  <i className={`${social.icon} text-sm`} />
                </a>
              ))}
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h4 className="mb-4 font-mono text-[11px] tracking-[0.2em] text-foreground-600 uppercase">
                <a href="#faq">{column.title}</a>
              </h4>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="cursor-pointer text-sm text-foreground-500 transition-colors hover:text-primary-500"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t hairline pt-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] text-foreground-600">
            <span className="flex items-center gap-2 whitespace-nowrap">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
              SSL 1.3
            </span>
            <span className="hidden text-foreground-700 sm:inline">·</span>
            <span className="whitespace-nowrap">model v3.2</span>
            <span className="hidden text-foreground-700 sm:inline">·</span>
            <span className="whitespace-nowrap">
              <b className="text-foreground-300">2.642</b> người đang dùng
            </span>
          </div>
          <p className="font-mono text-[11px] text-foreground-600">
            © {new Date().getFullYear()} TOOL AI YG88 · Chỉ dành cho người từ 18+ · Giải trí có trách nhiệm
          </p>
        </div>
      </div>
    </footer>
  );
}