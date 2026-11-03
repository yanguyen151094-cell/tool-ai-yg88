import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { buildRefLink, listStaff, myAgency } from '@/lib/adminStaff';
import type { AgencyInfo, StaffRow } from '@/lib/adminStaff';

const formatNumber = (value: number) => Number(value ?? 0).toLocaleString('vi-VN');

export default function AgencyPanel() {
  const { adminRole, profile } = useAuth();
  const isOwner = adminRole === 'owner';

  const [agency, setAgency] = useState<AgencyInfo | null>(null);
  const [agents, setAgents] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (isOwner) {
        const result = await listStaff();
        setAgents(result.items ?? []);
      } else {
        const result = await myAgency();
        setAgency(result.agency ?? null);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Không tải được thông tin đại lý.');
    } finally {
      setLoading(false);
    }
  }, [isOwner]);

  useEffect(() => {
    load();
  }, [load]);

  const totals = useMemo(
    () =>
      agents.reduce(
        (acc, item) => ({
          customers: acc.customers + Number(item.customer_count ?? 0),
          credited: acc.credited + Number(item.total_credited ?? 0),
        }),
        { customers: 0, credited: 0 },
      ),
    [agents],
  );

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(buildRefLink(code));
      setCopied(code);
      window.setTimeout(() => setCopied(''), 1800);
    } catch {
      setCopied('');
    }
  };

  const linkBoxClass =
    'flex min-w-0 flex-1 items-center gap-2 rounded-md border border-primary-500/30 bg-primary-500/5 px-2.5 py-2';

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-primary-500 uppercase">
            $ agency --link
          </p>
          <h2 className="mt-1 font-heading text-xl font-bold text-foreground-950">
            {isOwner ? 'Miền đại lý của các admin' : 'Link đại lý của tôi'}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-foreground-500">
            {isOwner
              ? 'Mỗi admin cấp dưới có một link đăng ký riêng. Khách đăng ký qua link nào thì thuộc đại lý đó, và bạn luôn thấy được toàn bộ.'
              : 'Gửi link này cho khách. Khách đăng ký qua link sẽ tự động thuộc đại lý của bạn.'}
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="flex cursor-pointer items-center gap-2 self-start rounded-md border hairline px-3 py-2 font-mono text-[11px] whitespace-nowrap text-foreground-300 transition-colors hover:text-primary-500"
        >
          <i className="ri-refresh-line" />
          tải lại
        </button>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-md border border-accent-500/40 bg-accent-500/10 px-3 py-2">
          <i className="ri-error-warning-line text-[13px] text-accent-500" />
          <p className="font-mono text-[11px] text-accent-500">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="mt-8 flex items-center justify-center gap-2 py-16 font-mono text-[12px] text-foreground-500">
          <i className="ri-loader-4-line animate-spin" />
          đang tải thông tin đại lý...
        </div>
      ) : isOwner ? (
        <div className="mt-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border hairline bg-background-100/60 p-4">
              <p className="font-mono text-[9px] tracking-[0.14em] text-foreground-600 uppercase">
                đại lý đang hoạt động
              </p>
              <p className="mt-2 font-heading text-2xl font-bold text-foreground-950">
                {agents.length}
              </p>
            </div>
            <div className="rounded-lg border hairline bg-background-100/60 p-4">
              <p className="font-mono text-[9px] tracking-[0.14em] text-foreground-600 uppercase">
                tổng khách của các đại lý
              </p>
              <p className="mt-2 font-heading text-2xl font-bold text-accent-500">
                {formatNumber(totals.customers)}
              </p>
            </div>
            <div className="rounded-lg border hairline bg-background-100/60 p-4">
              <p className="font-mono text-[9px] tracking-[0.14em] text-foreground-600 uppercase">
                tổng coin đã cộng
              </p>
              <p className="mt-2 font-heading text-2xl font-bold text-secondary-500">
                {formatNumber(totals.credited)}
              </p>
            </div>
          </div>

          {agents.length === 0 ? (
            <div className="mt-4 flex flex-col items-center justify-center rounded-lg border hairline bg-background-100/50 py-16">
              <i className="ri-links-line text-2xl text-foreground-600" />
              <p className="mt-3 font-mono text-[11px] text-foreground-500">
                chưa có đại lý nào. Tạo ở mục "Phân quyền admin".
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {agents.map((agent) => (
                <div
                  key={agent.user_id}
                  className="rounded-lg border hairline bg-background-100/60 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-[13px] text-foreground-950">
                        {agent.username || '(chưa đặt tên)'}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] text-foreground-600">
                        mã: {agent.ref_code || 'chưa cấp'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded border border-primary-500/30 bg-primary-500/10 px-2 py-1 font-mono text-[10px] whitespace-nowrap text-primary-500">
                        {formatNumber(agent.customer_count)} khách
                      </span>
                      <span className="rounded border border-secondary-500/30 bg-secondary-500/10 px-2 py-1 font-mono text-[10px] whitespace-nowrap text-secondary-500">
                        +{formatNumber(agent.total_credited)} coin
                      </span>
                    </div>
                  </div>

                  {agent.ref_code ? (
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <div className={linkBoxClass}>
                        <i className="ri-link shrink-0 text-[13px] text-primary-500" />
                        <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-foreground-400">
                          {buildRefLink(agent.ref_code)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copy(agent.ref_code as string)}
                        className="flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-primary-500/40 px-3 py-2 font-mono text-[10px] whitespace-nowrap text-primary-500 transition-colors hover:bg-primary-500/10"
                      >
                        <i
                          className={copied === agent.ref_code ? 'ri-check-line' : 'ri-file-copy-line'}
                        />
                        {copied === agent.ref_code ? 'đã chép' : 'chép link'}
                      </button>
                    </div>
                  ) : (
                    <p className="mt-2 font-mono text-[10px] text-accent-500">
                      chưa có mã đại lý — cấp mã ở mục "Phân quyền admin".
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="rounded-lg border hairline bg-background-100/60 p-5 lg:col-span-7">
            <p className="font-mono text-[10px] tracking-[0.16em] text-foreground-600 uppercase">
              link đăng ký của {agency?.username || profile?.username || 'bạn'}
            </p>
            {agency?.ref_code ? (
              <>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <div className={linkBoxClass}>
                    <i className="ri-link shrink-0 text-[14px] text-primary-500" />
                    <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-foreground-300">
                      {buildRefLink(agency.ref_code)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copy(agency.ref_code as string)}
                    className="flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md bg-primary-500 px-4 py-2.5 font-mono text-[11px] font-bold whitespace-nowrap text-background-50 transition-colors hover:bg-primary-400"
                  >
                    <i className={copied ? 'ri-check-line' : 'ri-file-copy-line'} />
                    {copied ? 'đã chép' : 'chép link'}
                  </button>
                </div>
                <div className="mt-4 rounded-md border hairline bg-background-50/60 p-3">
                  <p className="font-mono text-[9px] tracking-[0.14em] text-foreground-600 uppercase">
                    mã đại lý
                  </p>
                  <p className="mt-1 font-mono text-[15px] tracking-[0.1em] text-accent-500">
                    {agency.ref_code}
                  </p>
                </div>
              </>
            ) : (
              <p className="mt-3 rounded-md border border-accent-500/40 bg-accent-500/10 px-3 py-2 font-mono text-[11px] text-accent-500">
                Tài khoản của bạn chưa được cấp mã đại lý. Nhờ chủ web cấp giúp.
              </p>
            )}

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-md border hairline bg-background-50/60 p-3">
                <p className="font-mono text-[9px] tracking-[0.14em] text-foreground-600 uppercase">
                  khách đã đăng ký
                </p>
                <p className="mt-1.5 font-heading text-xl font-bold text-foreground-950">
                  {formatNumber(agency?.customer_count ?? 0)}
                </p>
              </div>
              <div className="rounded-md border hairline bg-background-50/60 p-3">
                <p className="font-mono text-[9px] tracking-[0.14em] text-foreground-600 uppercase">
                  coin đã cộng
                </p>
                <p className="mt-1.5 font-heading text-xl font-bold text-secondary-500">
                  {formatNumber(agency?.total_credited ?? 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border hairline bg-background-100/60 p-5 lg:col-span-5">
            <p className="font-mono text-[10px] tracking-[0.16em] text-foreground-600 uppercase">
              cách gửi khách
            </p>
            <ol className="mt-3 space-y-3">
              {[
                'Sao chép link đại lý ở khung bên trái.',
                'Gửi link cho khách qua Zalo / Telegram / Facebook.',
                'Khách mở link, bấm "Đăng ký" và tạo tài khoản.',
                'Tài khoản đó tự động nằm trong danh sách khách của bạn.',
              ].map((step, index) => (
                <li key={step} className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-primary-500/40 bg-primary-500/10 font-mono text-[10px] text-primary-500">
                    {index + 1}
                  </span>
                  <span className="font-mono text-[11px] leading-relaxed text-foreground-400">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-4 flex items-start gap-2 rounded-md border hairline bg-background-50/60 px-3 py-2 font-mono text-[10px] leading-relaxed text-foreground-500">
              <i className="ri-shield-check-line mt-0.5 text-[12px] text-primary-500" />
              Bạn chỉ thấy khách đăng ký qua link của mình. Khách của đại lý khác không hiển thị.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}