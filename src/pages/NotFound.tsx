import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background-50 px-4">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-50" />
      <div className="relative w-full max-w-md rounded-lg border border-primary-500/25 bg-background-100/80 p-6 term-glow">
        <p className="font-mono text-[11px] tracking-[0.18em] text-primary-500 uppercase">
          err 404 · route not found
        </p>
        <h1 className="mt-3 font-heading text-3xl font-bold text-foreground-950">
          Không tìm thấy trang
        </h1>
        <p className="mt-3 font-mono text-[11px] leading-relaxed text-foreground-500">
          <span className="text-primary-500">$</span> cd /{'{'}requested-path{'}'}
          <br />
          <span className="text-accent-500">bash: no such directory</span>
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link
            to="/"
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-primary-500 px-4 py-2.5 font-mono text-[12px] font-semibold whitespace-nowrap text-background-50 transition-colors hover:bg-primary-400"
          >
            <i className="ri-home-4-line" />
            Về trang chủ
          </Link>
          <Link
            to="/games"
            className="flex flex-1 items-center justify-center gap-2 rounded-md border border-primary-500/40 px-4 py-2.5 font-mono text-[12px] whitespace-nowrap text-foreground-200 transition-colors hover:border-primary-500/70 hover:text-primary-500"
          >
            Danh sách game
          </Link>
        </div>
      </div>
    </div>
  );
}