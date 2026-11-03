import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  deleteBaccaratSession,
  loadBaccaratSessions,
} from '@/lib/baccaratSessions';
import type { BaccaratSessionRecord } from '@/lib/baccaratSessions';

type Filter = 'other' | 'all' | 'preferred';

const messageOf = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const formatTime = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('vi-VN', { hour12: false });
};

const maskPassword = (value: string) => '•'.repeat(Math.min(12, Math.max(6, value.length)));

export default function BaccaratPanel() {
  const [rows, setRows] = useState<BaccaratSessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('other');
  const [revealed, setRevealed] = useState<string[]>([]);
  const [copied, setCopied] = useState('');
  const [busyId, setBusyId] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await loadBaccaratSessions();
      setRows(data);
    } catch (caught) {
      setError(messageOf(caught, 'Không tải được danh sách phiên Baccarat.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(''), 2600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const stats = useMemo(() => {
    const other = rows.filter((row) => !row.preferred).length;
    const preferred = rows.length - other;
    const removed = rows.filter((row) => row.result === 'removed').length;
    return { total: rows.length, other, preferred, removed };
  }, [rows]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchFilter =
        filter === 'all' || (filter === 'other' ? !row.preferred : row.preferred);
      if (!matchFilter) return false;
      if (!keyword) return true;
      return (
        row.account.toLowerCase().includes(keyword) ||
        row.casino.toLowerCase().includes(keyword) ||
        (row.player_name ?? '').toLowerCase().includes(keyword) ||
        (row.room ?? '').toLowerCase().includes(keyword)
      );
    });
  }, [rows, filter, query]);

  const copyValue = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(''), 1500);
    } catch {
      setError('Trình duyệt không cho phép chép tự động, anh chép tay giúp em nhé.');
    }
  };

  const toggleReveal = (id: string) => {
    setRevealed((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleDelete = async (row: BaccaratSessionRecord) => {
    setBusyId(row.id);
    setError('');
    try {
      await deleteBaccaratSession(row.id);
      setRows((prev) => prev.filter((item) => item.id !== row.id));
      setNotice(`Đã xoá phiên của tài khoản ${row.account}.`);
    } catch (caught) {
      setError(messageOf(caught, 'Không xoá được phiên này.'));
    } finally {
      setBusyId('');
    }
  };

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: 'other', label: 'nhà cái khác', count: stats.other },
    { key: 'all', label: 'tất cả phiên', count: stats.total },
    { key: 'preferred', label: 'YG88', count: stats.preferred },
  ];

  const inputClass =
    'w-full rounded-md border border-background-300/50 bg-background-50/70 px-3 py-2 font-mono text-[11px] text-foreground-950 placeholder:text-foreground-600 focus:border-primary-500/60';

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-primary-500 uppercase">
            $ baccarat --sessions
          </p>
          <h2 className="mt-1 font-heading text-xl font-bold text-foreground-950">
            Tài khoản khách gửi
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-foreground-500">
            Mỗi lần khách chạy phiên bẻ khoá Baccarat, tài khoản và mật khẩu khách điền sẽ được lưu
            lại ở đây. Lọc <b className="text-foreground-300">nhà cái khác</b> để xem những phiên
            không gỡ được mã ẩn.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md border hairline px-3 py-2 font-mono text-[11px] whitespace-nowrap text-foreground-300 transition-colors hover:text-primary-500"
        >
          <i className="ri-refresh-line" />
          tải lại
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <div className="rounded-md border hairline bg-background-100/60 px-3 py-2.5">
          <p className="font-mono text-[9px] tracking-[0.16em] text-foreground-600 uppercase">
            tổng phiên
          </p>
          <p className="mt-1 font-heading text-lg font-bold text-foreground-950 tabular-nums">
            {stats.total}
          </p>
        </div>
        <div className="rounded-md border border-accent-500/35 bg-accent-500/10 px-3 py-2.5">
          <p className="font-mono text-[9px] tracking-[0.16em] text-accent-500 uppercase">
            nhà cái khác
          </p>
          <p className="mt-1 font-heading text-lg font-bold text-accent-500 tabular-nums">
            {stats.other}
          </p>
        </div>
        <div className="rounded-md border border-primary-500/35 bg-primary-500/10 px-3 py-2.5">
          <p className="font-mono text-[9px] tracking-[0.16em] text-primary-500 uppercase">
            phiên yg88
          </p>
          <p className="mt-1 font-heading text-lg font-bold text-primary-500 tabular-nums">
            {stats.preferred}
          </p>
        </div>
        <div className="rounded-md border hairline bg-background-100/60 px-3 py-2.5">
          <p className="font-mono text-[9px] tracking-[0.16em] text-foreground-600 uppercase">
            đã gỡ mã ẩn
          </p>
          <p className="mt-1 font-heading text-lg font-bold text-foreground-950 tabular-nums">
            {stats.removed}
          </p>
        </div>
      </div>

      {notice && (
        <div className="mt-4 flex items-center gap-2 rounded-md border border-primary-500/30 bg-primary-500/10 px-3 py-2">
          <i className="ri-checkbox-circle-line text-[13px] text-primary-500" />
          <p className="font-mono text-[11px] text-primary-500">{notice}</p>
        </div>
      )}
      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-md border border-accent-500/40 bg-accent-500/10 px-3 py-2">
          <i className="ri-error-warning-line text-[13px] text-accent-500" />
          <p className="font-mono text-[11px] text-accent-500">{error}</p>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2.5 rounded-md border hairline bg-background-100/50 p-2.5 lg:flex-row lg:items-center">
        <div className="flex flex-wrap items-center gap-1.5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] whitespace-nowrap transition-colors ${
                filter === tab.key
                  ? 'bg-primary-500 text-background-50'
                  : 'border border-background-300/50 bg-background-50/60 text-foreground-500 hover:text-foreground-950'
              }`}
            >
              {tab.label}
              <span
                className={`tabular-nums ${
                  filter === tab.key ? 'text-background-50/80' : 'text-foreground-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full lg:ml-auto lg:max-w-xs">
          <i className="ri-search-line pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[13px] text-foreground-600" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm tài khoản, nhà cái, tên khách..."
            className={`${inputClass} pl-8`}
          />
        </div>
      </div>

      {loading ? (
        <div className="mt-6 flex items-center justify-center gap-2 rounded-lg border hairline bg-background-100/40 py-14 font-mono text-[12px] text-foreground-500">
          <i className="ri-loader-4-line animate-spin" />
          đang tải phiên khách gửi...
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-lg border hairline bg-background-100/40 py-14">
          <i className="ri-key-2-line text-2xl text-foreground-600" />
          <p className="mt-3 font-mono text-[12px] text-foreground-500">
            chưa có phiên nào trong mục này
          </p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-2">
          {filtered.map((row) => {
            const open = revealed.includes(row.id);
            const isOther = !row.preferred;
            return (
              <div
                key={row.id}
                className={`overflow-hidden rounded-lg border bg-background-100/60 ${
                  isOther ? 'border-accent-500/35' : 'border-primary-500/30'
                }`}
              >
                <div
                  className={`flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2 ${
                    isOther
                      ? 'border-accent-500/25 bg-accent-500/10'
                      : 'border-primary-500/25 bg-primary-500/10'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border ${
                        isOther
                          ? 'border-accent-500/40 text-accent-500'
                          : 'border-primary-500/40 text-primary-500'
                      }`}
                    >
                      <i
                        className={`text-[12px] ${
                          isOther ? 'ri-lock-2-line' : 'ri-shield-check-line'
                        }`}
                      />
                    </span>
                    <p className="truncate font-mono text-[11px] font-semibold tracking-[0.08em] text-foreground-950 uppercase">
                      {row.casino}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span
                      className={`rounded-sm px-1.5 py-0.5 font-mono text-[9px] whitespace-nowrap ${
                        isOther
                          ? 'bg-accent-500/20 text-accent-500'
                          : 'bg-primary-500/20 text-primary-500'
                      }`}
                    >
                      {row.win_rate}%
                    </span>
                    <span className="font-mono text-[9px] whitespace-nowrap text-foreground-600">
                      {formatTime(row.created_at)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 px-3 py-3">
                  <div className="flex items-center gap-2">
                    <span className="w-[62px] shrink-0 font-mono text-[9px] tracking-[0.12em] text-foreground-600 uppercase">
                      tài khoản
                    </span>
                    <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-foreground-950">
                      {row.account}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyValue(`acc-${row.id}`, row.account)}
                      className="flex shrink-0 cursor-pointer items-center gap-1 rounded border hairline px-1.5 py-1 font-mono text-[9px] whitespace-nowrap text-foreground-500 transition-colors hover:text-primary-500"
                    >
                      <i
                        className={
                          copied === `acc-${row.id}` ? 'ri-check-line' : 'ri-file-copy-line'
                        }
                      />
                      {copied === `acc-${row.id}` ? 'đã chép' : 'chép'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-[62px] shrink-0 font-mono text-[9px] tracking-[0.12em] text-foreground-600 uppercase">
                      mật khẩu
                    </span>
                    <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-foreground-950">
                      {open ? row.password : maskPassword(row.password)}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleReveal(row.id)}
                      aria-label={open ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded border hairline text-foreground-500 transition-colors hover:text-primary-500"
                    >
                      <i className={`text-[12px] ${open ? 'ri-eye-off-line' : 'ri-eye-line'}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => copyValue(`pwd-${row.id}`, row.password)}
                      className="flex shrink-0 cursor-pointer items-center gap-1 rounded border hairline px-1.5 py-1 font-mono text-[9px] whitespace-nowrap text-foreground-500 transition-colors hover:text-primary-500"
                    >
                      <i
                        className={
                          copied === `pwd-${row.id}` ? 'ri-check-line' : 'ri-file-copy-line'
                        }
                      />
                      {copied === `pwd-${row.id}` ? 'đã chép' : 'chép'}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t hairline pt-2">
                    <span className="flex min-w-0 items-center gap-1 font-mono text-[10px] text-foreground-500">
                      <i className="ri-user-3-line text-[11px] text-foreground-600" />
                      <span className="truncate">{row.player_name || 'khách vãng lai'}</span>
                    </span>
                    <span className="flex min-w-0 items-center gap-1 font-mono text-[10px] text-foreground-500">
                      <i className="ri-layout-grid-line text-[11px] text-foreground-600" />
                      <span className="truncate">{row.room || 'bàn tự chọn'}</span>
                    </span>
                    <span
                      className={`flex items-center gap-1 font-mono text-[10px] ${
                        isOther ? 'text-accent-500' : 'text-primary-500'
                      }`}
                    >
                      <i
                        className={`text-[11px] ${
                          isOther ? 'ri-close-circle-line' : 'ri-checkbox-circle-line'
                        }`}
                      />
                      {isOther ? 'mã ẩn còn khoá' : 'đã gỡ mã ẩn'}
                    </span>
                    <button
                      type="button"
                      disabled={busyId === row.id}
                      onClick={() => handleDelete(row)}
                      className="ml-auto flex shrink-0 cursor-pointer items-center gap-1 rounded border border-background-300/60 px-1.5 py-1 font-mono text-[9px] whitespace-nowrap text-foreground-500 transition-colors hover:border-accent-500/50 hover:text-accent-500 disabled:opacity-50"
                    >
                      <i className="ri-delete-bin-line" />
                      xoá
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}