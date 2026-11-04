import { coinTiers } from '@/mocks/plans';
import DepositAction from '@/components/base/DepositAction';
import { useAuth } from '@/hooks/useAuth';
import { useDepositUrl } from '@/lib/deposit';

export default function Plans() {
  const { user } = useAuth();
  const { url: depositUrl } = useDepositUrl(user?.id ?? null);

  const grid = coinTiers.filter((tier) => !tier.wide);
  const wide = coinTiers.find((tier) => tier.wide);

  return (
    <section className="relative border-t hairline py-16 md:py-24" id="pricing">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.10),transparent_60%)]" />
      <div className="relative mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-10">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="font-mono text-[11px] tracking-[0.22em] text-primary-500 uppercase">
            // nạp nhận xu
          </p>
          <h2 className="mt-3 font-heading text-2xl font-bold text-foreground-950 md:text-4xl">
            Nạp càng nhiều, nhận càng nhiều
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground-500">
            Xu dùng để mở phiên phân tích. Không tự động gia hạn, không phí ẩn.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5">
          {grid.map((tier) => (
            <article
              key={tier.id}
              className="group relative overflow-hidden rounded-lg border border-accent-500/35 bg-gradient-to-b from-primary-100/50 via-background-100/90 to-background-100 p-4 transition-colors hover:border-accent-500/70 md:p-5"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-accent-500/10 blur-2xl" />

              {tier.badge && (
                <span className="absolute right-3 top-3 rounded-full border border-accent-500/50 bg-accent-500/15 px-2.5 py-1 font-mono text-[9px] tracking-[0.1em] whitespace-nowrap text-accent-500 uppercase">
                  {tier.badge}
                </span>
              )}

              <p className="font-mono text-[11px] tracking-[0.18em] text-foreground-500 uppercase">
                Nạp {tier.deposit}
                {tier.unit}
              </p>

              <div className="mt-3 flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-500/12 text-accent-500 ring-1 ring-accent-500/30">
                  <i className="ri-coins-fill text-[22px]" />
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-heading text-3xl font-bold text-accent-500 md:text-4xl">
                    {tier.xu}
                  </span>
                  <span className="font-heading text-lg font-semibold text-foreground-900">XU</span>
                </div>
              </div>

              <p className="mt-3 text-[13px] leading-relaxed text-foreground-400">{tier.note}</p>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-accent-500/15 pt-4">
                <span className="font-mono text-[10px] tracking-[0.1em] text-foreground-600 uppercase">
                  ≈ {tier.xu} phiên phân tích
                </span>
                <DepositAction
                  url={depositUrl}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-accent-500/45 px-3.5 py-2 font-mono text-[12px] font-semibold whitespace-nowrap text-accent-500 transition-colors hover:bg-accent-500 hover:text-background-50"
                >
                  Nạp ngay
                  <i className="ri-arrow-right-line" />
                </DepositAction>
              </div>
            </article>
          ))}

          {wide && (
            <article className="group relative overflow-hidden rounded-lg border border-accent-500/50 bg-gradient-to-r from-primary-100/60 via-background-100 to-primary-100/40 p-4 sm:col-span-2 md:p-6">
              <div className="pointer-events-none absolute -left-12 -bottom-14 h-40 w-40 rounded-full bg-accent-500/12 blur-3xl" />

              {wide.badge && (
                <span className="absolute right-3 top-3 rounded-full border border-accent-500/50 bg-accent-500/15 px-2.5 py-1 font-mono text-[9px] tracking-[0.1em] whitespace-nowrap text-accent-500 uppercase">
                  {wide.badge}
                </span>
              )}

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-mono text-[11px] tracking-[0.18em] text-foreground-500 uppercase">
                    Nạp {wide.deposit}
                    {wide.unit}
                  </p>
                  <div className="mt-2.5 flex items-center gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-500/12 text-accent-500 ring-1 ring-accent-500/30">
                      <i className="ri-coins-fill text-[24px]" />
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-heading text-3xl font-bold text-accent-500 md:text-5xl">
                        {wide.xu}
                      </span>
                      <span className="font-heading text-lg font-semibold text-foreground-900">
                        XU
                      </span>
                    </div>
                  </div>
                  <p className="mt-2.5 text-[13px] text-foreground-400">{wide.note}</p>
                </div>

                <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                  <span className="font-mono text-[10px] tracking-[0.1em] whitespace-nowrap text-foreground-600 uppercase">
                    ≈ {wide.xu} phiên phân tích
                  </span>
                  <DepositAction
                    url={depositUrl}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-accent-500 px-5 py-2.5 font-mono text-[12px] font-bold whitespace-nowrap text-background-50 transition-colors hover:bg-accent-400"
                  >
                    Nạp gói này
                    <i className="ri-arrow-right-line" />
                  </DepositAction>
                </div>
              </div>
            </article>
          )}
        </div>

        <p className="mt-6 text-center font-mono text-[10px] text-foreground-600">
          * Xu không phải tiền tệ, không quy đổi ngược và không dùng để đặt cược.
        </p>
      </div>
    </section>
  );
}