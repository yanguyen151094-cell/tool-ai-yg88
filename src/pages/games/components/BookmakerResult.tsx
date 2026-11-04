import { useState } from 'react';
import CodeClaimModal from './CodeClaimModal';
import BookmakerLogo from './BookmakerLogo';
import AccountCheck from './AccountCheck';
import { formatVnd, foundedYear } from './bookmakerScript';
import { useLiveWinRate } from '@/hooks/useLiveWinRate';
import type { VaultCode } from './bookmakerScript';
import type { Bookmaker } from '@/lib/bookmakers';

type Props = {
  bookmaker: Bookmaker;
  preferred: boolean;
  winRate: number;
  vault: VaultCode[];
  canUseCodes: boolean;
  onRescan: () => void;
  onClose: () => void;
};

export default function BookmakerResult({
  bookmaker,
  preferred,
  winRate,
  vault,
  canUseCodes,
  onRescan,
  onClose,
}: Props) {
  const [copied, setCopied] = useState('');
  const [claimOpen, setClaimOpen] = useState(false);
  const liveRate = useLiveWinRate(winRate);
  const year = foundedYear(bookmaker.name, bookmaker.domain);

  const copyCode = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      window.setTimeout(() => setCopied(''), 1600);
    } catch {
      setCopied('');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border hairline bg-background-50/70 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <BookmakerLogo
            name={bookmaker.name}
            domain={bookmaker.domain}
            logoUrl={bookmaker.logoUrl}
            featured={bookmaker.featured}
          />
          <div className="min-w-0">
            <p className="truncate font-heading text-[14px] font-bold text-foreground-950">
              {bookmaker.name}
            </p>
            <p className="truncate font-mono text-[9px] tracking-[0.1em] text-foreground-600 uppercase">
              {bookmaker.domain} · {bookmaker.region} · phiên quét đã kết thúc
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onRescan}
            className="flex cursor-pointer items-center gap-1.5 rounded border border-primary-500/40 px-2.5 py-1.5 font-mono text-[10px] whitespace-nowrap text-primary-500 transition-colors hover:bg-primary-500/10"
          >
            <i className="ri-refresh-line" />
            quét lại phiên mới
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex cursor-pointer items-center gap-1.5 rounded border hairline px-2.5 py-1.5 font-mono text-[10px] whitespace-nowrap text-foreground-400 transition-colors hover:text-foreground-950"
          >
            <i className="ri-close-line" />
            đóng
          </button>
        </div>
      </div>

      <AccountCheck bookmaker={bookmaker} winRate={liveRate} />

      {!preferred && (
        <>
          <div className="rounded-md border border-accent-500/30 bg-accent-500/5 p-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-accent-500/40 bg-accent-500/15 px-2.5 py-1 font-mono text-[9px] tracking-[0.14em] text-accent-500 uppercase">
                <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-accent-500" />
                đang thu hút vốn
              </span>
              <span className="rounded-full border hairline bg-background-50/70 px-2.5 py-1 font-mono text-[9px] tracking-[0.12em] text-foreground-500 uppercase">
                không có mã code
              </span>
            </div>
            <p className="mt-3 rounded-md border border-accent-500/40 bg-accent-500/10 px-3 py-2.5 font-heading text-[13px] leading-relaxed font-bold text-accent-500 uppercase md:text-[14px]">
              nhà cái này hoạt động từ năm {year}, đang trong quá trình thu hồi vốn từ người chơi,
              tỷ lệ thắng ở nhà cái này hiện đang là{' '}
              <span className="font-heading text-[19px] tabular-nums md:text-[22px]">
                {liveRate}%
              </span>
            </p>
            <p className="mt-2 font-mono text-[9px] leading-relaxed text-foreground-600">
              con số % nhảy liên tục trong khoảng 0% – 20% sau mỗi phiên quét.
            </p>
          </div>

          <div className="rounded-md border hairline bg-background-50/60 p-3.5">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="font-mono text-[9px] tracking-[0.16em] text-foreground-600 uppercase">
                  tỷ lệ thắng phiên này
                </p>
                <p className="mt-1 flex items-baseline gap-1 font-heading text-3xl font-bold text-primary-500 tabular-nums">
                  {liveRate}
                  <span className="text-sm font-semibold text-foreground-500">%</span>
                </p>
              </div>
              <p className="font-mono text-[10px] text-foreground-600">
                khung dao động: <span className="text-foreground-300">0% – 20%</span>
              </p>
            </div>
            <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-background-300/50">
              <div
                className="h-full rounded-full bg-accent-500 transition-all duration-500"
                style={{ width: `${Math.max(2, (liveRate / 20) * 100)}%` }}
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: 'dòng tiền vào', value: bookmaker.volume },
                { label: 'ví nóng', value: '4' },
                { label: 'độ lệch', value: '1.8%' },
                { label: 'mã code', value: '0' },
              ].map((item) => (
                <div key={item.label} className="rounded border hairline bg-background-100/60 px-2 py-1.5">
                  <p className="truncate font-mono text-[8px] tracking-[0.12em] text-foreground-600 uppercase">
                    {item.label}
                  </p>
                  <p className="mt-0.5 truncate font-mono text-[11px] font-semibold text-foreground-950 tabular-nums">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-2.5 font-mono text-[9px] leading-relaxed text-foreground-600">
              con số tự nhảy liên tục trong khoảng 0% – 20% và bấm “quét lại phiên mới” để đổi dữ
              liệu quét.
            </p>
          </div>
        </>
      )}

      {preferred && !canUseCodes && (
        <div className="rounded-md border border-accent-500/30 bg-accent-500/5 p-4">
          <p className="flex items-center gap-2 font-mono text-[11px] text-accent-500">
            <i className="ri-lock-2-line" />
            Khu mã code chuyên nghiệp chỉ mở cho admin được chủ web cấp quyền.
          </p>
        </div>
      )}

      {preferred && canUseCodes && (
        <>
          <div className="rounded-md border border-primary-500/30 bg-primary-500/5 p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-mono text-[9px] tracking-[0.16em] text-primary-500 uppercase">
                  $ license --export
                </p>
                <p className="mt-1 font-heading text-[14px] font-bold text-foreground-950">
                  Loạt 8 mã code chuyên nghiệp của {bookmaker.name}
                </p>
              </div>
              <span className="rounded-full border border-primary-500/40 bg-primary-500/10 px-2.5 py-1 font-mono text-[9px] tracking-[0.12em] text-primary-500 uppercase">
                {vault.length} khoá · đã giải
              </span>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {vault.map((item, index) => (
                <div
                  key={item.serial}
                  className="flex items-center gap-2 rounded border hairline bg-background-50/80 px-2 py-1.5"
                >
                  <span className="w-4 shrink-0 font-mono text-[9px] text-foreground-600 tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono text-[12px] tracking-[0.1em] text-primary-500">
                      {item.serial}
                    </span>
                    <span className="block truncate font-mono text-[9px] text-foreground-600 tabular-nums">
                      mã {item.code} · {formatVnd(item.amount)}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => copyCode(item.serial)}
                    className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded border hairline text-foreground-500 transition-colors hover:text-primary-500"
                    aria-label={`Chép mã ${item.serial}`}
                  >
                    <i
                      className={
                        copied === item.serial ? 'ri-check-line text-[11px]' : 'ri-file-copy-line text-[11px]'
                      }
                    />
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-2.5 font-mono text-[9px] leading-relaxed text-foreground-600">
              Mỗi khoá có mệnh giá riêng trong thang 8K – 588K. Quét lại phiên mới sẽ đổi serial
              của từng khoá.
            </p>
          </div>

          <div className="rounded-md border hairline bg-background-50/60 p-3.5">
            <p className="font-mono text-[9px] tracking-[0.16em] text-foreground-600 uppercase">
              nhập code chuyên nghiệp
            </p>
            <button
              type="button"
              onClick={() => setClaimOpen(true)}
              className="mt-2 flex w-full cursor-pointer items-center gap-2.5 rounded-md border border-primary-500/35 bg-background-50/80 px-3 py-3 text-left transition-colors hover:border-primary-500/70 hover:bg-primary-500/5"
            >
              <i className="ri-qr-scan-2-line text-[16px] text-primary-500" />
              <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-foreground-500">
                Nhập mã code (vd: 588)
              </span>
              <span className="flex shrink-0 items-center gap-1 rounded border border-primary-500/45 px-2 py-1 font-mono text-[10px] whitespace-nowrap text-primary-500">
                <i className="ri-external-link-line text-[11px]" />
                mở
              </span>
            </button>
            <p className="mt-2 font-mono text-[9px] leading-relaxed text-foreground-600">
              Bấm vào ô trên để mở cửa sổ nhập <span className="text-foreground-300">mã code</span>{' '}
              và <span className="text-foreground-300">tên tài khoản</span>. Nhập đúng mã sẽ báo
              thành công kèm số tiền của mã đó.
            </p>
          </div>
        </>
      )}

      <CodeClaimModal
        open={claimOpen}
        vault={vault}
        bookmakerName={bookmaker.name}
        onClose={() => setClaimOpen(false)}
      />
    </div>
  );
}