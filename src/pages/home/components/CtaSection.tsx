import { Link } from 'react-router-dom';

export default function CtaSection() {
  return (
    <section className="relative overflow-hidden border-t hairline">
      <div className="absolute inset-0">
        <img
          src="https://readdy.ai/api/search-image?query=abstract%20dark%20server%20room%20corridor%20with%20emerald%20green%20light%20strips%20and%20glowing%20data%20cables%2C%20minimal%20futuristic%20architecture%2C%20deep%20black%20tones%20with%20neon%20green%20accents%2C%20cinematic%20wide%20shot&width=1600&height=700&seq=gg88-cta-grid-bg&orientation=landscape"
          alt="Không gian máy chủ TOOL AI YG88"
          title="TOOL AI YG88 - console vận hành 24/7"
          className="h-full w-full object-cover object-top opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background-50 via-background-50/85 to-background-50/60" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-16 md:px-6 md:py-24 lg:px-10">
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] tracking-[0.22em] text-primary-500 uppercase">
            $ ready --when-you-are
          </p>
          <h2 className="mt-4 font-heading text-2xl leading-tight font-bold text-foreground-950 md:text-[42px]">
            Mở console, xem dữ liệu trước khi vào bàn
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-foreground-400 md:text-[15px]">
            Đăng ký mất 20 giây. Bạn xem được toàn bộ bàn Baccarat và phòng Nổ hũ đang mở ngay sau khi
            đăng nhập.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 rounded-md bg-primary-500 px-6 py-3 font-mono text-[13px] font-bold whitespace-nowrap text-background-50 transition-colors hover:bg-primary-400"
            >
              <i className="ri-flashlight-line text-base" />
              TẠO TÀI KHOẢN MIỄN PHÍ
            </Link>
            <Link
              to="/games"
              className="flex items-center justify-center gap-2 rounded-md border border-primary-500/40 px-6 py-3 font-mono text-[13px] whitespace-nowrap text-foreground-200 transition-colors hover:border-primary-500/70 hover:text-primary-500"
            >
              Xem bảng game
              <i className="ri-arrow-right-line" />
            </Link>
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] tracking-[0.14em] text-foreground-600 uppercase">
            <span className="flex items-center gap-1.5">
              <i className="ri-check-line text-primary-500" /> không cần thẻ
            </span>
            <span className="flex items-center gap-1.5">
              <i className="ri-check-line text-primary-500" /> hỗ trợ 24/7
            </span>
            <span className="flex items-center gap-1.5">
              <i className="ri-check-line text-primary-500" /> chỉ 18+
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}