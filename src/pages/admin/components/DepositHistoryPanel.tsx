import { useCallback, useEffect, useMemo, useState } from 'react';
import { listCustomers } from '@/lib/adminStaff';
import {
  DEPOSIT_STATUSES,
  DEPOSIT_STATUS_LABEL,
  createDepositTransaction,
  deleteDepositTransaction,
  depositDayMonth,
  depositMoney,
  loadDepositTransactions,
  rangeOf,
  updateDepositTransaction,
  type DepositStatus,
  type DepositTx,
  type DepositTxInput,
  type RangeTab,
} from '@/lib/depositHistory';
import DepositTxCard from './DepositTxCard';
import DepositTxEditor from './DepositTxEditor';

const TABS: { key: RangeTab; label: string }[] = [
  { key: 'today', label: 'Hôm nay' },
  { key: 'yesterday', label: 'Hôm qua' },
  { key: 'week', label: 'Một tuần' },
];

const selectClass =
  'w-full cursor-pointer rounded-md border border-background-300/50 bg-background-50/70 px-3 py-2 font-mono text-[11px] text-foreground-950 focus:border-primary-500/60';

const messageOf = (caught: unknown, fallback: string) =>
  caught instanceof Error ? caught.message : fallback;

export default function DepositHistoryPanel() {
  const [list, setList] = useState<DepositTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [tab, setTab] = useState<RangeTab>('today');
  const [channel, setChannel] = useState('all');
  const [status, setStatus] = useState<'all' | DepositStatus>('all');
  const [customers, setCustomers] = useState<{ id: string; username: string | null }[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<DepositTx | null>(null);
  const [saving, setSaving] = useState(false);
  const [editorError, setEditorError] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const rows = await loadDepositTransactions();
      setList(rows);
    } catch (caught) {
      setList([]);
      setError(messageOf(caught, 'Không tải được lịch sử nạp tiền.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    listCustomers()
      .then((result) => setCustomers(result.items ?? []))
      .catch(() => setCustomers([]));
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(''), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const channels = useMemo(() => {
    const unique = Array.from(new Set(list.map((item) => item.channel).filter(Boolean)));
    return unique.sort((a, b) => a.localeCompare(b, 'vi'));
  }, [list]);

  const range = useMemo(() => rangeOf(tab), [tab]);

  const filtered = useMemo(() => {
    const from = range.from.getTime();
    const to = range.to.getTime();
    return list.filter((item) => {
      const time = new Date(item.depositedAt).getTime();
      if (Number.isNaN(time) || time < from || time > to) return false;
      if (channel !== 'all' && item.channel !== channel) return false;
      if (status !== 'all' && item.status !== status) return false;
      return true;
    });
  }, [list, range, channel, status]);

  const totalCredited = filtered.reduce((sum, item) => sum + Number(item.credited ?? 0), 0);

  const openCreate = () => {
    setEditing(null);
    setEditorError('');
    setEditorOpen(true);
  };

  const openEdit = (item: DepositTx) => {
    setEditing(item);
    setEditorError('');
    setEditorOpen(true);
  };

  const handleSubmit = async (input: DepositTxInput) => {
    setSaving(true);
    setEditorError('');
    try {
      if (editing) {
        await updateDepositTransaction(editing.id, input);
        setNotice(`Đã lưu thay đổi giao dịch ${input.code || ''}`.trim());
      } else {
        await createDepositTransaction(input);
        setNotice(`Đã thêm giao dịch ${input.code || ''}`.trim());
      }
      setEditorOpen(false);
      setEditing(null);
      await load();
    } catch (caught) {
      setEditorError(messageOf(caught, 'Chưa lưu được giao dịch.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: DepositTx) => {
    setDeletingId(item.id);
    setError('');
    try {
      await deleteDepositTransaction(item.id);
      setList((prev) => prev.filter((row) => row.id !== item.id));
      setNotice(`Đã xóa giao dịch ${item.code || ''}`.trim());
    } catch (caught) {
      setError(messageOf(caught, 'Chưa xóa được giao dịch.'));
    } finally {
      setDeletingId('');
    }
  };

  return (
    <div className="bg-background-50">
      <div className="flex flex-col gap-2 border-b hairline bg-background-50 px-3 pt-2 pb-0 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <div className="grid grid-cols-3 gap-1">
          {TABS.map((item) => {
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={`relative cursor-pointer px-2 py-3 text-[12px] whitespace-nowrap transition-colors sm:px-3 sm:py-2.5 ${
                  active
                    ? 'font-semibold text-primary-500'
                    : 'text-foreground-500 hover:text-foreground-950'
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-1 bottom-0 h-[2px] rounded-full bg-primary-500" />
                )}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-2 items-center gap-2 pb-2 sm:flex sm:pb-0">
          <button
            type="button"
            onClick={load}
            className="flex cursor-pointer items-center justify-center gap-1.5 rounded-md border hairline px-3 py-2.5 text-[11px] whitespace-nowrap text-foreground-500 transition-colors hover:text-primary-500 sm:py-2"
          >
            <i className={loading ? 'ri-loader-4-line animate-spin' : 'ri-refresh-line'} />
            tải lại
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="flex cursor-pointer items-center justify-center gap-1.5 rounded-md bg-primary-500 px-3.5 py-2.5 text-[11px] font-bold whitespace-nowrap text-background-50 transition-colors hover:bg-primary-600 sm:py-2"
          >
            <i className="ri-add-line" />
            thêm giao dịch
          </button>
        </div>
      </div>

      {notice && (
        <div className="mx-3 mt-3 flex items-center gap-2 rounded-md border border-primary-500/30 bg-primary-500/10 px-3 py-2">
          <i className="ri-checkbox-circle-line text-[13px] text-primary-500" />
          <p className="font-mono text-[11px] text-primary-500">{notice}</p>
        </div>
      )}
      {error && (
        <div className="mx-3 mt-3 flex items-center gap-2 rounded-md border border-accent-500/40 bg-accent-500/10 px-3 py-2">
          <i className="ri-error-warning-line text-[13px] text-accent-500" />
          <p className="font-mono text-[11px] text-accent-500">{error}</p>
        </div>
      )}

      <div className="bg-background-50">
        <div className="grid grid-cols-1 gap-2 border-b hairline bg-background-100 px-3 py-3 sm:grid-cols-2 lg:grid-cols-3">
          <select
            value={channel}
            onChange={(event) => setChannel(event.target.value)}
            className={selectClass}
            aria-label="Loại tiền nạp"
          >
            <option value="all">Tất cả loại tiền nạp</option>
            {channels.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as 'all' | DepositStatus)}
            className={selectClass}
            aria-label="Trạng thái"
          >
            <option value="all">Tất cả trạng thái</option>
            {DEPOSIT_STATUSES.map((item) => (
              <option key={item} value={item}>
                {DEPOSIT_STATUS_LABEL[item]}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 rounded-md border border-primary-500/30 bg-background-50/70 px-3 py-2 font-mono text-[11px] text-foreground-400">
            <i className="ri-calendar-line text-[13px] text-primary-500" />
            <span className="whitespace-nowrap">
              {depositDayMonth(range.from)} - {depositDayMonth(range.to)}
            </span>
          </div>

          {(channel !== 'all' || status !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setChannel('all');
                setStatus('all');
              }}
              className="flex cursor-pointer items-center justify-center gap-1.5 rounded-md border hairline px-3 py-2 font-mono text-[11px] whitespace-nowrap text-foreground-400 transition-colors hover:text-accent-500"
            >
              <i className="ri-filter-off-line" />
              bỏ lọc
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 font-mono text-[12px] text-foreground-500">
            <i className="ri-loader-4-line animate-spin" />
            đang tải lịch sử nạp tiền...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <i className="ri-inbox-archive-line text-2xl text-foreground-600" />
            <p className="mt-3 font-mono text-[12px] text-foreground-500">
              không có giao dịch trong khoảng này
            </p>
            <button
              type="button"
              onClick={openCreate}
              className="mt-3 flex cursor-pointer items-center gap-1.5 rounded-md border border-primary-500/40 px-3 py-2 font-mono text-[11px] whitespace-nowrap text-primary-500 transition-colors hover:bg-primary-500/10"
            >
              <i className="ri-add-line" />
              thêm giao dịch
            </button>
          </div>
        ) : (
          <div>
            {filtered.map((item) => (
              <DepositTxCard
                key={item.id}
                item={item}
                deleting={deletingId === item.id}
                onEdit={() => openEdit(item)}
                onDelete={() => handleDelete(item)}
              />
            ))}
          </div>
        )}

        <div className="flex flex-col gap-1 border-t hairline bg-background-100 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <p className="text-[10px] tracking-[0.06em] text-foreground-600 uppercase sm:text-[11px]">
            tổng số tiền vào tài khoản ({filtered.length} giao dịch)
          </p>
          <p className="font-mono text-[16px] font-bold text-foreground-950 sm:text-[15px]">
            {depositMoney(totalCredited)}
          </p>
        </div>
      </div>

      <DepositTxEditor
        open={editorOpen}
        editing={editing}
        customers={customers}
        saving={saving}
        error={editorError}
        onClose={() => {
          setEditorOpen(false);
          setEditing(null);
          setEditorError('');
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}