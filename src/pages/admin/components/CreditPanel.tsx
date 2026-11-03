import { useCallback, useEffect, useState } from 'react';
import { callAdminStaff } from '@/lib/adminStaff';
import type { CreditCustomer, CreditLog } from '@/lib/adminStaff';

const formatCoins = (value: number) => Number(value ?? 0).toLocaleString('vi-VN');

const formatTime = (value: string) =>
  new Date(value).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function CreditPanel() {
  const [query, setQuery] = useState('');
  const [customer, setCustomer] = useState<CreditCustomer | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [searching, setSearching] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [history, setHistory] = useState<CreditLog[]>([]);

  const loadHistory = useCallback(async () => {
    try {
      const result = await callAdminStaff<{ items: CreditLog[] }>({ action: 'my_history' });
      setHistory(result.items ?? []);
    } catch {
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setCustomer(null);
    if (query.trim().length < 3) {
      setError('Nhập chính xác tên đăng nhập của khách (từ 3 ký tự).');
      return;
    }
    setSearching(true);
    try {
      const result = await callAdminStaff<{ customer: CreditCustomer }>({
        action: 'lookup',
        query: query.trim(),
      });
      setCustomer(result.customer);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Không tìm được khách.');
    } finally {
      setSearching(false);
    }
  };

  const handleCredit = async () => {
    if (!customer) return;
    setError('');
    setNotice('');
    const parsed = Number(amount.replace(/[^0-9]/g, ''));
    if (!parsed || parsed <= 0) {
      setError('Nhập số điểm hợp lệ (lớn hơn 0).');
      return;
    }
    setBusy(true);
    try {
      const result = await callAdminStaff<{ username: string | null; amount: number }>({
        action: 'credit',
        user_id: customer.id,
        amount: parsed,
        note: note.trim(),
      });
      setNotice(`Đã cộng ${formatCoins(result.amount)} điểm cho ${result.username || 'khách'}.`);
      setAmount('');
      setNote('');
      setCustomer(null);
      setQuery('');
      await loadHistory();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Không cộng được điểm.');
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    'w-full rounded-md border border-background-300/50 bg-background-50/70 px-3 py-2.5 font-mono text-[12px] text-foreground-950 placeholder:text-foreground-600 focus:border-primary-500/60';

  return (
    <div>
      <p className="font-mono text-[10px] tracking-[0.2em] text-primary-500 uppercase">
        $ credit --add
      </p>
      <h2 className="mt-1 font-heading text-xl font-bold text-foreground-950">Cộng điểm cho khách</h2>
      <p className="mt-1 text-sm text-foreground-500">
        Nhập đúng tên đăng nhập của khách để cộng điểm. Admin đại lý chỉ tìm được khách đăng ký qua
        link của mình.
      </p>

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
        <div className="rounded-lg border hairline bg-background-100/60 p-4 lg:col-span-6">
          <form onSubmit={handleSearch} className="flex flex-col gap-2 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <i className="ri-search-line pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[13px] text-foreground-600" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tên đăng nhập của khách"
                autoCapitalize="none"
                spellCheck={false}
                className={`${inputClass} pl-8`}
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-primary-500/40 px-4 py-2.5 font-mono text-[11px] font-bold whitespace-nowrap text-primary-500 transition-colors hover:bg-primary-500/10 disabled:opacity-60"
            >
              {searching ? (
                <i className="ri-loader-4-line animate-spin" />
              ) : (
                <i className="ri-user-search-line" />
              )}
              tìm khách
            </button>
          </form>

          {customer && (
            <div className="mt-4 rounded-md border hairline bg-background-50/60 p-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary-500/30 bg-primary-500/10 font-heading text-[13px] font-bold text-primary-500">
                  {(customer.username ?? 'U').slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-mono text-[13px] text-foreground-950">
                    {customer.username}
                  </p>
                  <p className="font-mono text-[10px] text-foreground-600">đã tìm thấy khách</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] tracking-[0.14em] text-foreground-600 uppercase">
                    Số điểm cộng
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
                    placeholder="Nạp qua chuyển khoản"
                    maxLength={120}
                    className={inputClass}
                  />
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleCredit}
                  className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md bg-primary-500 px-3 py-2.5 font-mono text-[11px] font-bold whitespace-nowrap text-background-50 transition-colors hover:bg-primary-400 disabled:opacity-60"
                >
                  {busy ? <i className="ri-loader-4-line animate-spin" /> : <i className="ri-add-line" />}
                  cộng điểm
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-lg border hairline bg-background-100/60 p-4 lg:col-span-6">
          <p className="font-mono text-[10px] tracking-[0.16em] text-foreground-600 uppercase">
            lần cộng gần đây của tôi
          </p>
          {history.length === 0 ? (
            <p className="mt-3 font-mono text-[11px] text-foreground-500">chưa có lần cộng nào.</p>
          ) : (
            <div className="mt-2 max-h-80 space-y-1.5 overflow-y-auto pr-1">
              {history.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between gap-2 rounded border hairline bg-background-50/50 px-2 py-1.5"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono text-[10px] text-foreground-500">
                      {tx.note || 'cộng điểm'}
                    </span>
                    <span className="block font-mono text-[9px] text-foreground-600">
                      {formatTime(tx.created_at)}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-[11px] text-primary-500">
                    +{formatCoins(Number(tx.amount))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}