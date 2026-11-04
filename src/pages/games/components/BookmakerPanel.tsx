import { useMemo, useState } from 'react';
import BookmakerScanModal from './BookmakerScanModal';
import { bookmakers } from '@/mocks/bookmakers';
import type { Bookmaker } from '@/mocks/bookmakers';

type Props = {
  allowed: boolean;
  canUseCodes: boolean;
};

export default function BookmakerPanel({ allowed, canUseCodes }: Props) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Bookmaker | null>(null);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return bookmakers;
    return bookmakers.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.domain.toLowerCase().includes(keyword) ||
        item.region.toLowerCase().includes(keyword),
    );
  }, [query]);

  if (!allowed) {
    return (
      <div className="mt-4 flex flex-col items-center justify-center rounded-lg border hairline bg-background-100/50 px-4 py-14 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-accent-500/40 bg-accent-500/10">
          <i className="ri-lock-2-line text-lg text-accent-500" />
        </span>
        <p className="mt-3 font-heading text-[15px] font-bold text-foreground-950">
          Mục quét mã nhà cái đang khoá
        </p>
        <p className="mt-1.5 max-w-md font-mono text-[11px] leading-relaxed text-foreground-500">
          Chức năng này chỉ dành cho tài khoản admin được chủ web cấp quyền. Liên hệ chủ web để được
          bật quyền “quét mã nhà cái”.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="relative overflow-hidden rounded-lg border hairline bg-background-100/60 p-4 md:p-5">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-[10px] tracking-[0.2em] text-primary-500 uppercase">
              $ bookmaker --scan
            </p>
            <h2 className="mt-1 font-heading text-lg font-bold text-foreground-950 md:text-xl">
              Quét mã code nhà cái
            </h2>
            <p className="mt-1 max-w-2xl font-mono text-[10px] leading-relaxed text-foreground-500">
              Danh mục tất cả nhà cái đang theo dõi. Bấm vào một nhà cái để mở cửa sổ chạy mã code
              chuyên nghiệp và xem kết quả sau khi quét xong.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="flex items-center gap-1.5 rounded border hairline bg-background-50/60 px-2.5 py-1.5 font-mono text-[10px] whitespace-nowrap">
              <i className="ri-building-4-line text-primary-500" />
              <span className="text-foreground-600">nhà cái</span>
              <span className="text-foreground-950">{bookmakers.length}</span>
            </span>
            <span className="flex items-center gap-1.5 rounded border border-primary-500/30 bg-primary-500/10 px-2.5 py-1.5 font-mono text-[10px] whitespace-nowrap text-primary-500">
              <i className="ri-shield-check-line" />
              quyền admin đã bật
            </span>
          </div>
        </div>

        <div className="relative mt-3 max-w-xs">
          <i className="ri-search-line pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[13px] text-foreground-600" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm nhà cái..."
            className="w-full rounded border border-background-300/50 bg-background-50/70 py-1.5 pl-8 pr-2.5 font-mono text-[11px] text-foreground-950 placeholder:text-foreground-600 focus:border-primary-500/60"
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-b hairline pb-2">
        <p className="font-mono text-[10px] tracking-[0.16em] text-foreground-600 uppercase">
          danh mục nhà cái / quét mã
        </p>
        <p className="flex items-center gap-1.5 font-mono text-[10px] whitespace-nowrap text-foreground-600">
          <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-primary-500" />
          {`${filtered.length} nhà cái · mã hoá tls 1.3`}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-lg border hairline bg-background-100/50 py-14">
          <i className="ri-search-eye-line text-2xl text-foreground-600" />
          <p className="mt-3 font-mono text-[12px] text-foreground-500">
            không tìm thấy nhà cái phù hợp
          </p>
          <button
            type="button"
            onClick={() => setQuery('')}
            className="mt-4 cursor-pointer rounded-md border border-primary-500/40 px-4 py-2 font-mono text-[11px] whitespace-nowrap text-primary-500 transition-colors hover:bg-primary-500 hover:text-background-50"
          >
            xoá bộ lọc
          </button>
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelected(item)}
              className={`group cursor-pointer rounded-lg border p-3 text-left transition-colors ${
                item.featured
                  ? 'border-primary-500/40 bg-primary-500/5 hover:border-primary-500/70'
                  : 'hairline bg-background-100/60 hover:border-primary-500/40'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border font-heading text-[12px] font-bold ${
                    item.featured
                      ? 'border-primary-500/50 bg-primary-500/15 text-primary-500'
                      : 'border-background-300/60 bg-background-50/70 text-foreground-300'
                  }`}
                >
                  {item.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate font-heading text-[13px] font-bold text-foreground-950">
                      {item.name}
                    </span>
                    {item.featured && (
                      <span className="shrink-0 rounded-full border border-primary-500/40 bg-primary-500/15 px-1.5 py-0.5 font-mono text-[8px] tracking-[0.1em] text-primary-500 uppercase">
                        ưu tiên
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block truncate font-mono text-[9px] text-foreground-600">
                    {item.domain} · {item.region}
                  </span>
                </span>
              </div>

              <div className="mt-2.5 flex items-center justify-between gap-2 border-t hairline pt-2">
                <span className="min-w-0">
                  <span className="block truncate font-mono text-[9px] text-foreground-600">
                    {item.note}
                  </span>
                  <span className="mt-0.5 block font-mono text-[10px] font-semibold text-foreground-300 tabular-nums">
                    {item.volume}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1 rounded border border-primary-500/40 px-2 py-1 font-mono text-[9px] whitespace-nowrap text-primary-500 transition-colors group-hover:bg-primary-500 group-hover:text-background-50">
                  <i className="ri-play-line" />
                  chạy mã
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      <p className="mt-4 flex items-start gap-2 rounded-md border hairline bg-background-100/50 px-3 py-2.5 font-mono text-[10px] leading-relaxed text-foreground-600">
        <i className="ri-shield-keyhole-line mt-0.5 text-primary-500" />
        Nhà cái thường chỉ hiển thị trạng thái thu hút vốn và tỷ lệ thắng 0–20% mỗi phiên. Riêng
        YG88 mở khoá chuyên nghiệp với loạt mã code và bảng nhập code — chỉ admin được cấp quyền mới
        dùng được.
      </p>

      <BookmakerScanModal
        open={selected !== null}
        bookmaker={selected}
        canUseCodes={canUseCodes}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}