import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { PlayerProfile } from '@/hooks/useAuth';
import { isSyntheticEmail, prettyPhone } from '@/lib/phone';
import { deleteUserAccount, resetUserPassword, suggestPassword } from '@/lib/adminUsers';

type CoinTx = {
  id: string;
  amount: number;
  note: string | null;
  created_at: string;
};

const messageOf = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const formatCoins = (value: number) => Number(value ?? 0).toLocaleString('vi-VN');

const emailLabel = (row: PlayerProfile) => {
  if (row.email && !isSyntheticEmail(row.email)) return row.email;
  if (row.phone) return `SĐT ${prettyPhone(row.phone)}`;
  if (row.telegram) return `@${row.telegram}`;
  return 'tài khoản nội bộ';
};

export default function UsersPanel({ canAdjust = true }: { canAdjust?: boolean }) {
  const { user } = useAuth();
  const [rows, setRows] = useState<PlayerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [history, setHistory] = useState<CoinTx[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState('');
  const [resetOpen, setResetOpen] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [removeOpen, setRemoveOpen] = useState(false);
  const [accountBusy, setAccountBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const copyValue = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(''), 1600);
    } catch {
      setCopied('');
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, email, username, coins, phone, telegram')
        .order('created_at', { ascending: false })
        .limit(500);
      if (fetchError) throw fetchError;
      setRows((data ?? []) as PlayerProfile[]);
    } catch (caught) {
      setError(messageOf(caught, 'Không tải được danh sách người dùng.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const selected = useMemo(
    () => rows.find((row) => row.id === selectedId) ?? null,
    [rows, selectedId],
  );

  const loadHistory = useCallback(async (userId: string) => {
    setHistoryLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('coin_transactions')
        .select('id, amount, note, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30);
      if (fetchError) throw fetchError;
      setHistory((data ?? []) as CoinTx[]);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedId) loadHistory(selectedId);
    else setHistory([]);
  }, [selectedId, loadHistory]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return rows;
    return rows.filter(
      (row) =>
        (row.username ?? '').toLowerCase().includes(keyword) ||
        (row.email ?? '').toLowerCase().includes(keyword) ||
        (row.phone ?? '').toLowerCase().includes(keyword) ||
        (row.telegram ?? '').toLowerCase().includes(keyword) ||
        row.id.toLowerCase().includes(keyword),
    );
  }, [rows, query]);

  const handleAdjust = async (direction: 1 | -1) => {
    if (!selected) return;
    const parsed = Number(amount.replace(/[^0-9]/g, ''));
    if (!parsed || parsed <= 0) {
      setError('Nhập số coin hợp lệ (lớn hơn 0).');
      return;
    }
    const delta = parsed * direction;
    const nextCoins = Number(selected.coins ?? 0) + delta;
    if (nextCoins < 0) {
      setError('Số dư sau khi trừ không được âm.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ coins: nextCoins, updated_at: new Date().toISOString() })
        .eq('id', selected.id);
      if (updateError) throw updateError;

      const { error: txError } = await supabase.from('coin_transactions').insert({
        user_id: selected.id,
        amount: delta,
        note: note.trim() || (direction === 1 ? 'Admin cộng coin' : 'Admin trừ coin'),
        created_by: user?.id ?? null,
      });
      if (txError) throw txError;

      setRows((prev) =>
        prev.map((row) => (row.id === selected.id ? { ...row, coins: nextCoins } : row)),
      );
      setNotice(
        `Đã ${direction === 1 ? 'cộng' : 'trừ'} ${formatCoins(parsed)} coin cho ${
          selected.username || selected.email
        }.`,
      );
      setAmount('');
      setNote('');
      await loadHistory(selected.id);
    } catch (caught) {
      setError(messageOf(caught, 'Không cập nhật được coin.'));
    } finally {
      setBusy(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selected) return;
    if (resetPassword.trim().length < 6) {
      setError('Mật khẩu mới cần từ 6 ký tự.');
      return;
    }
    const name = selected.username || 'khách';
    setAccountBusy(true);
    setError('');
    setNotice('');
    try {
      await resetUserPassword(selected.id, resetPassword.trim());
      setNotice(
        `Đã đặt lại mật khẩu cho ${name}. Gửi mật khẩu mới cho khách và nhắc họ đổi lại sau khi đăng nhập.`,
      );
      setResetOpen(false);
      setResetPassword('');
    } catch (caught) {
      setError(messageOf(caught, 'Không đặt lại được mật khẩu.'));
    } finally {
      setAccountBusy(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selected) return;
    const name = selected.username || 'khách';
    setAccountBusy(true);
    setError('');
    setNotice('');
    try {
      await deleteUserAccount(selected.id);
      setRows((prev) => prev.filter((row) => row.id !== selected.id));
      setHistory([]);
      setSelectedId(null);
      setRemoveOpen(false);
      setResetOpen(false);
      setNotice(`Đã xóa tài khoản ${name} cùng lịch sử coin và phiên Baccarat của khách.`);
    } catch (caught) {
      setError(messageOf(caught, 'Không xóa được tài khoản.'));
    } finally {
      setAccountBusy(false);
    }
  };

  const inputClass =
    'w-full rounded-md border border-background-300/50 bg-background-50/70 px-3 py-2 font-mono text-[11px] text-foreground-950 placeholder:text-foreground-600 focus:border-primary-500/60';

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-primary-500 uppercase">
            $ users --list
          </p>
          <h2 className="mt-1 font-heading text-xl font-bold text-foreground-950">
            Quản lý người dùng
          </h2>
          <p className="mt-1 text-sm text-foreground-500">
            Xem tài khoản đã đăng ký, cộng hoặc trừ coin và theo dõi lịch sử giao dịch.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-md border hairline bg-background-100/70 px-3 py-2 font-mono text-[11px]">
            <span className="text-foreground-600">tổng </span>
            <span className="text-foreground-950">{rows.length}</span>
            <span className="text-foreground-600"> tài khoản</span>
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

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="relative">
            <i className="ri-search-line pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[13px] text-foreground-600" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo tên, số điện thoại, telegram hoặc email..."
              className={`${inputClass} pl-8`}
            />
          </div>

          <div className="mt-3 overflow-hidden rounded-lg border hairline">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-14 font-mono text-[12px] text-foreground-500">
                <i className="ri-loader-4-line animate-spin" />
                đang tải người dùng...
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14">
                <i className="ri-user-search-line text-2xl text-foreground-600" />
                <p className="mt-3 font-mono text-[12px] text-foreground-500">
                  chưa có người dùng nào đăng ký
                </p>
              </div>
            ) : (
              <div className="divide-y divide-background-200/60">
                {filtered.map((row) => (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(row.id);
                      setNotice('');
                      setError('');
                      setResetOpen(false);
                      setResetPassword('');
                      setRemoveOpen(false);
                      setShowPassword(false);
                    }}
                    className={`flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors ${
                      selectedId === row.id ? 'bg-primary-500/10' : 'hover:bg-background-100/40'
                    }`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary-500/30 bg-primary-500/10 font-heading text-[12px] font-bold text-primary-500">
                      {(row.username ?? row.email ?? 'U').slice(0, 1).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-mono text-[12px] text-foreground-950">
                        {row.username || '(chưa đặt tên)'}
                      </span>
                      <span className="block truncate font-mono text-[10px] text-foreground-600">
                        {row.phone
                          ? prettyPhone(row.phone)
                          : row.telegram
                            ? `@${row.telegram}`
                            : isSyntheticEmail(row.email)
                              ? 'chưa có liên hệ'
                              : row.email || row.id}
                      </span>
                      {row.telegram && (
                        <span className="mt-0.5 flex items-center gap-1 font-mono text-[9px] text-primary-500">
                          <i className="ri-telegram-line" />@{row.telegram}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block font-mono text-[12px] text-accent-500">
                        {formatCoins(row.coins)}
                      </span>
                      <span className="block font-mono text-[10px] text-foreground-600">coin</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5">
          {selected ? (
            <div className="rounded-lg border hairline bg-background-100/60 p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-heading text-sm font-bold text-foreground-950">
                    {selected.username || 'Người chơi'}
                  </p>
                  <p className="mt-0.5 truncate font-mono text-[10px] text-foreground-600">
                    {emailLabel(selected)}
                  </p>
                </div>
                <div className="shrink-0 rounded-md border border-accent-500/30 bg-accent-500/10 px-2.5 py-1.5 text-right">
                  <p className="font-mono text-[13px] text-accent-500">{formatCoins(selected.coins)}</p>
                  <p className="font-mono text-[9px] tracking-[0.12em] text-accent-500/80 uppercase">
                    coin
                  </p>
                </div>
              </div>

              <div className="mt-3 rounded-md border hairline bg-background-50/60 p-2.5">
                <p className="mb-2 font-mono text-[9px] tracking-[0.14em] text-foreground-600 uppercase">
                  liên hệ khách hàng
                </p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <i className="ri-smartphone-line w-4 shrink-0 text-[13px] text-primary-500" />
                    {selected.phone ? (
                      <a
                        href={`tel:${selected.phone}`}
                        className="min-w-0 flex-1 truncate font-mono text-[12px] text-foreground-950 transition-colors hover:text-primary-500"
                      >
                        {prettyPhone(selected.phone)}
                      </a>
                    ) : (
                      <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-foreground-600">
                        chưa có SĐT
                      </span>
                    )}
                    {selected.phone && (
                      <button
                        type="button"
                        onClick={() => copyValue('phone', selected.phone ?? '')}
                        className="flex shrink-0 cursor-pointer items-center gap-1 rounded border hairline px-2 py-1 font-mono text-[9px] whitespace-nowrap text-foreground-400 transition-colors hover:text-primary-500"
                      >
                        <i className={copied === 'phone' ? 'ri-check-line' : 'ri-file-copy-line'} />
                        {copied === 'phone' ? 'đã chép' : 'chép'}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <i className="ri-telegram-line w-4 shrink-0 text-[13px] text-primary-500" />
                    {selected.telegram ? (
                      <a
                        href={`https://t.me/${selected.telegram}`}
                        target="_blank"
                        rel="noreferrer"
                        className="min-w-0 flex-1 truncate font-mono text-[12px] text-foreground-950 transition-colors hover:text-primary-500"
                      >
                        @{selected.telegram}
                      </a>
                    ) : (
                      <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-foreground-600">
                        chưa có telegram
                      </span>
                    )}
                    {selected.telegram && (
                      <button
                        type="button"
                        onClick={() => copyValue('telegram', `@${selected.telegram ?? ''}`)}
                        className="flex shrink-0 cursor-pointer items-center gap-1 rounded border hairline px-2 py-1 font-mono text-[9px] whitespace-nowrap text-foreground-400 transition-colors hover:text-primary-500"
                      >
                        <i
                          className={copied === 'telegram' ? 'ri-check-line' : 'ri-file-copy-line'}
                        />
                        {copied === 'telegram' ? 'đã chép' : 'chép'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {!canAdjust && (
                <p className="mt-4 rounded-md border hairline bg-background-50/60 px-3 py-2 font-mono text-[10px] text-foreground-500">
                  Nhân viên chỉ cộng điểm ở tab "Cộng điểm".
                </p>
              )}
              <div className={`mt-4 space-y-2 ${canAdjust ? '' : 'hidden'}`}>
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] tracking-[0.14em] text-foreground-600 uppercase">
                    Số coin
                  </label>
                  <input
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="1000"
                    inputMode="numeric"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] tracking-[0.14em] text-foreground-600 uppercase">
                    Ghi chú
                  </label>
                  <input
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Nạp coin qua chuyển khoản"
                    className={inputClass}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleAdjust(1)}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md bg-primary-500 px-3 py-2 font-mono text-[11px] font-bold whitespace-nowrap text-background-50 transition-colors hover:bg-primary-400 disabled:opacity-60"
                  >
                    <i className="ri-add-line" />
                    cộng coin
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleAdjust(-1)}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-accent-500/50 px-3 py-2 font-mono text-[11px] font-bold whitespace-nowrap text-accent-500 transition-colors hover:bg-accent-500/10 disabled:opacity-60"
                  >
                    <i className="ri-subtract-line" />
                    trừ coin
                  </button>
                </div>
              </div>

              {canAdjust && (
                <div className="mt-5 border-t hairline pt-3">
                  <p className="font-mono text-[10px] tracking-[0.16em] text-foreground-600 uppercase">
                    tài khoản đăng nhập
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setResetOpen((prev) => !prev);
                        setResetPassword('');
                        setShowPassword(false);
                        setRemoveOpen(false);
                        setError('');
                        setNotice('');
                      }}
                      className="flex cursor-pointer items-center gap-1.5 rounded border hairline px-2.5 py-1.5 font-mono text-[10px] whitespace-nowrap text-foreground-400 transition-colors hover:text-primary-500"
                    >
                      <i className="ri-key-2-line" />
                      cấp lại mật khẩu
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRemoveOpen((prev) => !prev);
                        setResetOpen(false);
                        setResetPassword('');
                        setError('');
                        setNotice('');
                      }}
                      className="flex cursor-pointer items-center gap-1.5 rounded border border-accent-500/40 px-2.5 py-1.5 font-mono text-[10px] whitespace-nowrap text-accent-500 transition-colors hover:bg-accent-500/10"
                    >
                      <i className="ri-user-unfollow-line" />
                      xóa tài khoản
                    </button>
                  </div>

                  {resetOpen && (
                    <div className="mt-2 rounded-md border border-primary-500/30 bg-primary-500/5 p-2.5">
                      <p className="font-mono text-[10px] text-foreground-500">
                        Đặt mật khẩu mới cho {selected.username || 'khách'}. Khách đăng nhập lại bằng
                        tên đăng nhập cũ cùng mật khẩu này.
                      </p>
                      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                        <div className="relative min-w-0 flex-1">
                          <input
                            value={resetPassword}
                            onChange={(event) => setResetPassword(event.target.value)}
                            placeholder="Mật khẩu mới (từ 6 ký tự)"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="off"
                            className={`${inputClass} pr-9`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                            title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                            className="absolute top-1/2 right-1.5 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded text-foreground-500 transition-colors hover:text-primary-500"
                          >
                            <i
                              className={`text-[14px] ${
                                showPassword ? 'ri-eye-off-line' : 'ri-eye-line'
                              }`}
                            />
                          </button>
                        </div>
                        <button
                          type="button"
                          disabled={accountBusy}
                          onClick={() => {
                            setResetPassword(suggestPassword());
                            setShowPassword(true);
                          }}
                          className="flex cursor-pointer items-center justify-center gap-1.5 rounded-md border hairline px-3 py-2 font-mono text-[10px] whitespace-nowrap text-foreground-400 transition-colors hover:text-primary-500 disabled:opacity-60"
                        >
                          <i className="ri-magic-line" />
                          tạo tự động
                        </button>
                        <button
                          type="button"
                          disabled={accountBusy}
                          onClick={handleResetPassword}
                          className="cursor-pointer rounded-md bg-primary-500 px-4 py-2 font-mono text-[11px] font-bold whitespace-nowrap text-background-50 transition-colors hover:bg-primary-400 disabled:opacity-60"
                        >
                          lưu
                        </button>
                      </div>
                    </div>
                  )}

                  {removeOpen && (
                    <div className="mt-2 rounded-md border border-accent-500/40 bg-accent-500/10 p-2.5">
                      <p className="font-mono text-[10px] leading-relaxed text-accent-500">
                        Xóa vĩnh viễn {selected.username || 'khách'}? Tài khoản đăng nhập, số coin,
                        lịch sử giao dịch và phiên Baccarat sẽ mất và không khôi phục được.
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled={accountBusy}
                          onClick={handleDeleteUser}
                          className="cursor-pointer rounded-md border border-accent-500/60 px-3 py-1.5 font-mono text-[10px] font-bold whitespace-nowrap text-accent-500 transition-colors hover:bg-accent-500/10 disabled:opacity-60"
                        >
                          xác nhận xóa
                        </button>
                        <button
                          type="button"
                          onClick={() => setRemoveOpen(false)}
                          className="cursor-pointer rounded-md border hairline px-3 py-1.5 font-mono text-[10px] whitespace-nowrap text-foreground-400 transition-colors hover:text-foreground-950"
                        >
                          hủy
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-5 border-t hairline pt-3">
                <p className="font-mono text-[10px] tracking-[0.16em] text-foreground-600 uppercase">
                  lịch sử giao dịch
                </p>
                {historyLoading ? (
                  <p className="mt-3 font-mono text-[11px] text-foreground-500">đang tải...</p>
                ) : history.length === 0 ? (
                  <p className="mt-3 font-mono text-[11px] text-foreground-500">
                    chưa có giao dịch nào.
                  </p>
                ) : (
                  <div className="mt-2 max-h-56 space-y-1.5 overflow-y-auto pr-1">
                    {history.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between gap-2 rounded border hairline bg-background-50/50 px-2 py-1.5"
                      >
                        <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-foreground-500">
                          {tx.note || 'giao dịch'}
                        </span>
                        <span
                          className={`shrink-0 font-mono text-[11px] ${
                            Number(tx.amount) >= 0 ? 'text-primary-500' : 'text-accent-500'
                          }`}
                        >
                          {Number(tx.amount) >= 0 ? '+' : ''}
                          {formatCoins(Number(tx.amount))}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center rounded-lg border hairline bg-background-100/50 px-4 py-14">
              <i className="ri-user-settings-line text-2xl text-foreground-600" />
              <p className="mt-3 text-center font-mono text-[11px] text-foreground-500">
                chọn một người dùng bên trái để cộng / trừ coin
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}