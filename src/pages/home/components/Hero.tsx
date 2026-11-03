import { Link } from 'react-router-dom';
import TermWindow from '@/components/base/TermWindow';
import WinTicker from '@/components/feature/WinTicker';
import { winners } from '@/mocks/winners';
import { useSiteContent } from '@/lib/content';

const stats = [
  { label: 'người đang dùng', value: '2.642' },
  { label: 'độ khớp mô hình', value: '94%' },
  { label: 'luồng dữ liệu', value: '1.247' },
  { label: 'thời gian hoạt động', value: '24/7' },
];

export default function Hero() {
  const { values } = useSiteContent();

  return (
    <section className="relative overflow-hidden pt-24 pb-12 md:pt-32 md:pb-20">
      <div className="absolute inset-0">
        <img
          src={values.hero_bg_image}
          alt="Nền bảng điều khiển TOOL AI YG88"
          title="TOOL AI YG88 - AI predict console"
          className="h-full w-full object-cover object-top opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background-50/85 via-background-50/80 to-background-50" />
        <div className="absolute inset-0 grid-bg opacity-60" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-10">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] text-primary-500 uppercase">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-primary-500" />
              {values.hero_badge}
            </div>

            <p className="mb-3 font-mono text-[12px] text-foreground-500">
              <span className="text-primary-500">$</span> ssh ai@predict.local
            </p>

            <h1 className="font-heading text-[38px] leading-[1.05] font-bold tracking-tight text-foreground-950 sm:text-5xl lg:text-[64px]">
              {values.hero_title_prefix}{' '}
              <span className="text-primary-500 text-glow">{values.hero_title_highlight}</span>
              <br />
              {values.hero_title_suffix}
              <span className="ml-2 inline-block h-[0.72em] w-[0.42em] animate-caret bg-primary-500 align-baseline" />
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-relaxed text-foreground-400 md:text-[15px]">
              {values.hero_subtitle}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 rounded-md bg-primary-500 px-6 py-3 font-mono text-[13px] font-bold whitespace-nowrap text-background-50 transition-colors hover:bg-primary-400"
              >
                <i className="ri-key-2-line text-base" />
                {values.hero_cta_primary}
              </Link>
              <Link
                to="/games"
                className="flex items-center justify-center gap-2 rounded-md border border-primary-500/40 px-6 py-3 font-mono text-[13px] font-semibold whitespace-nowrap text-foreground-200 transition-colors hover:border-primary-500/70 hover:text-primary-500"
              >
                <i className="ri-live-line text-base" />
                {values.hero_cta_secondary}
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="border-l border-primary-500/25 pl-3">
                  <p className="font-heading text-xl font-bold text-foreground-950 md:text-[26px]">
                    {stat.value}
                  </p>
                  <p className="mt-1 font-mono text-[10px] leading-tight tracking-[0.12em] text-foreground-600 uppercase">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <TermWindow title="tail -f /var/log/wins.log" bodyClassName="p-3 md:p-4">
              <div className="scanlines absolute inset-0" />
              <WinTicker items={winners} variant="hero" />
              <div className="mt-3 space-y-2 border-t hairline pt-3">
                {winners.slice(0, 3).map((win) => (
                  <div
                    key={win.user}
                    className="flex items-center justify-between gap-3 font-mono text-[11px]"
                  >
                    <span className="flex items-center gap-2 text-foreground-500">
                      <span className="text-primary-500">[OK]</span>
                      {win.user}
                    </span>
                    <span className="text-primary-500">{win.amount}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between rounded border border-primary-500/20 bg-primary-500/5 px-3 py-2 font-mono text-[10px] text-foreground-500">
                <span>streams: 1.247</span>
                <span className="text-primary-500">encrypted</span>
              </div>
            </TermWindow>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-md border hairline bg-background-100/70 p-3">
                <p className="font-mono text-[10px] tracking-[0.14em] text-foreground-600 uppercase">
                  Baccarat
                </p>
                <p className="mt-1 font-heading text-lg font-bold text-accent-500">6 bàn live</p>
              </div>
              <div className="rounded-md border hairline bg-background-100/70 p-3">
                <p className="font-mono text-[10px] tracking-[0.14em] text-foreground-600 uppercase">
                  Nổ hũ / slot
                </p>
                <p className="mt-1 font-heading text-lg font-bold text-foreground-950">12 phòng</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}